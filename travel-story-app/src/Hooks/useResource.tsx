import { useMemo } from "react";
import config from "../Utils/Config";

const useAssetResource = (filename: string, defaultAsset?: any) => {
    return useMemo(() => filename ? `${config.assetBaseUrl}/${filename}` : defaultAsset, [filename])
}

export default useAssetResource;