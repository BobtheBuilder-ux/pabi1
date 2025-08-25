import {ENV_VALUES} from "../../config/env.config";
import {API_SuccessPayload, ImageUploadResponse} from "../types";
import {getTokens} from "../utils/tokenHelpers.ts";

export const fileUploader = async (file: File, url: string): Promise<API_SuccessPayload<ImageUploadResponse>> => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getTokens()?.accessToken;
    const response = await fetch(`${ENV_VALUES.BASE_URL}${url}`, {
        method: "POST",
        body: formData,
        headers: {
            "Accept": "application/json",
            "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`,
        },
    });


    if (!response.ok) {
        throw new Error("File upload failed");
    }

    return await response.json();
}