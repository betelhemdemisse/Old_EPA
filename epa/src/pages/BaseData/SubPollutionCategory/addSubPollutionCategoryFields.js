export default function addSubPollutionCategoryFields(categories = []) {
    return [
        {
            name: "pollution_category_id",
            label: "Pollution Category",
            type: "select",
            options: categories.map((c) => ({
                label: c.pollution_category,
                value: c.id
            })),
            required: true,
        },
        {
            name: "sub_pollution_category",
            label: "Sub Pollution Category",
            type: "text",
            required: true,
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
        },
    ];
}
