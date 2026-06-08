import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Board of Mentors — OFIR",
    short_name: "Mentors OFIR",
    description: "Tu board privado de mentores extraordinarios",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f2ec",
    theme_color: "#f5f2ec",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
