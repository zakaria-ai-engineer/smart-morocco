import api, { toAbsoluteMediaUrl } from "./api";

export interface Media {
  title: string;
  type: string;
  url: string;
  category?: string;
}

export async function getMediaByCategory(category: string): Promise<Media[]> {
  try {
    const response = await api.get<Media[]>("/media/category/" + encodeURIComponent(category));
    return response.data.map(m => ({ ...m, url: toAbsoluteMediaUrl(m.url) || m.url }));
  } catch (error) {
    console.error("Failed to fetch media by category:", error);
    return [];
  }
}

