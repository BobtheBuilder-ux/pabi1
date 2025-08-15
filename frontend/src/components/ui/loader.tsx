import {cn} from "../../lib/utils/utils";

export default function GLoader({
                                    className,
                                    fullScreen = false,
                                    useMainBorder = true,
                                }: {
    className?: string;
    fullScreen?: boolean;
    useMainBorder?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex items-center justify-center",
                fullScreen && "h-screen"
            )}
        >
            <div
                className={cn(
                    `animate-spin rounded-full h-32 w-32 border-b-2 ${useMainBorder ? "border-[#8a358a]" : "border-white"}`,
                    className
                )}
            ></div>
        </div>
    );
}
