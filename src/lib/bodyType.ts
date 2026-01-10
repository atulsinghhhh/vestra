export enum BodyTypeEnum {
    RECTANGLE = 'rectangle',
    TRIANGLE = 'triangle',
    INVERTED_TRIANGLE = 'inverted_triangle',
    HOURGLASS = 'hourglass',
    APPLE = 'apple',
}

export enum MeasurementUnitEnum {
    METRIC = 'metric',
    IMPERIAL = 'imperial',
}

export function BodyClassifyType({ shoulderWidth, waist, hips }: {
    shoulderWidth: number;
    waist: number;
    hips: number;
}) {
    // const shoulderWaistRatio = shoulderWidth / waist; // Unused
    // const hipShoulderRatio = hips / shoulderWidth; // Unused

    if (Math.abs(shoulderWidth - hips) < 2 && waist < shoulderWidth * 0.75) {
        return BodyTypeEnum.HOURGLASS;
    }

    if (hips > shoulderWidth * 1.05) {
        return BodyTypeEnum.TRIANGLE;
    }

    if (shoulderWidth > hips * 1.05) {
        return BodyTypeEnum.INVERTED_TRIANGLE;
    }

    if (waist > shoulderWidth && waist > hips) {
        return BodyTypeEnum.APPLE;
    }

    return BodyTypeEnum.RECTANGLE;
}



