import type * as webdav from "webdav";

export const splitdirs = (dir: string): (string | string)[] => {
	const list = dir.split("/");
	const next = list.pop();
	return [list.join("/"), next ?? ""];
};

export const makedirs = async (client: webdav.WebDAVClient, dir: string) => {
	if (!(await client.exists(dir))) {
		await makedirs(client, splitdirs(dir)[0]);
		await client.createDirectory(dir);
	}
};
