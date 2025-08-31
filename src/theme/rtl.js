import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

export default function createRtlCache() {
  return createCache({
    key: "mui-rtl",
    stylisPlugins: [rtlPlugin, prefixer],
  });
}
