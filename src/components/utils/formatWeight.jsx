export const formatWeight = (weight) => {
    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight)) return "";

    if (numericWeight < 1) {
        // 0.25 -> 250 g
        return `${Math.round(numericWeight * 1000)} g`;
    }
    // 1.00 -> 1 kg
    return `${numericWeight} kg`;
};