import colorutil from "color-util";

export const colorBetween = (color1, color2, position) => {
    const ratingGradient = colorutil.hsv.gradient({
        type: "linear",
        colors: [
            colorutil.color(color1).hsv,
            colorutil.color(color2).hsv
        ]
    })
    return colorutil.rgb.to.hex(colorutil.hsv.to.rgb(ratingGradient(position, 0)))
}
