import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import * as dotenv from "dotenv";
import { Hono } from "hono";
import { promises as fs } from "node:fs";
import { getFonts, twitterSnapCookies } from "twitter-snap";
import { FFmpegInfrastructure } from "twitter-snap-core";
import * as webdav from "webdav";
import { z } from "zod";
import { makedirs } from "./webdav.js";

dotenv.config();
const app = new Hono();
const preloadClient = twitterSnapCookies("cookies.json");
const preloadFonts = getFonts(".cache/fonts");

const nextcloud = webdav.createClient(process.env.WEBDAV_URL!, {
	username: process.env.WEBDAV_USERNAME!,
	password: process.env.WEBDAV_PASSWORD!,
	maxBodyLength: Number.POSITIVE_INFINITY,
	maxContentLength: Number.POSITIVE_INFINITY,
});

const outputDir = process.env.WEBDAV_OUTPUT_DIR!;

const _ = makedirs(nextcloud, outputDir);
const port = Number(process.env.PORT) || 3000;

app.get(
	"/api/:id",
	zValidator(
		"param",
		z.object({
			id: z.string().regex(/^[0-9]{1,19}$/),
		}),
	),
	async (c) => {
		const [client, api] = await preloadClient;
		const id = c.req.valid("param").id;
		console.log(`snap tweet id: ${id}`);
		await client(
			{ id: id, limit: 1, type: "getTweetDetail", startId: id },
			async (render) => {
				const finalize = await render({
					output: `temp/${id}.{if-photo:png:mp4}`,
					themeName: "RenderOceanBlueColor",
					themeParam: {
						ffmpeg: new FFmpegInfrastructure(),
						fonts: await preloadFonts,
						width: 1440,
						scale: 2,
					},
				});
				await finalize({ cleanup: true });
			},
		);

		console.log(`snap tweet id: ${id} done`);

		const files = (await fs.readdir("temp")).filter((file) => {
			return file.includes(id);
		});

		const file = files[0];
		const data = await fs.readFile(`temp/${file}`);
		await nextcloud.putFileContents(`${outputDir}/${file}`, data);
		await fs.unlink(`temp/${file}`);

		if (file.endsWith(".png")) {
			c.header("Content-Type", "image/png");
		} else if (file.endsWith(".mp4")) {
			c.header("Content-Type", "video/mp4");
		}

		c.status(200);
		return c.body(data);
	},
);

console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
