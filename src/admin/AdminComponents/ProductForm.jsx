import React from "react";
import { Box, Typography, TextField, FormControl, Select, MenuItem } from "@mui/material";
import { h7, h6 } from "../../styles/typographyStyles.jsx";
import { inputStyles, inputDropdown, selectMenuProps } from '../../styles/inputStyles.jsx';
import WeightSelectorAdmin from "../AdminComponents/WeightSelectorAdmin.jsx";

export default function ProductForm({
    productName, setProductName,
    category, setCategory,
    stock, setStock,
    price, setPrice,
    weight, setWeight,
    description, setDescription,
    productType = 'product',
    availableCategories = [], 
}) {
    return (
        <Box sx={{mt:3}}>
            <Typography sx={{ ...h7 }} mb={1}>Product name</Typography>
            <TextField fullWidth value={productName || ""}  onChange={(e) => setProductName(e.target.value)} sx={{ ...inputStyles, mb: 2 }}/>

            <Typography sx={{ ...h7 }} mb={1}>Category</Typography>
            {category && category !== "custom" && availableCategories && !availableCategories.includes(category) ? (
                <TextField 
                    fullWidth 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    sx={{ ...inputStyles, mb: 2 }}
                    placeholder="Enter category"
                />
            ) : category === "custom" ? (
                <TextField 
                    fullWidth 
                    value="" 
                    onChange={(e) => {
                        const value = e.target.value;
                        setCategory(value || "custom");
                    }} 
                    sx={{ ...inputStyles, mb: 2 }}
                    placeholder="Enter new category"
                    autoFocus
                />
            ) : (
                <FormControl fullWidth sx={{ ...h6, ...inputDropdown, ...inputStyles, mb: 2 }}>
                    <Select 
                        value={category || ""} 
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "custom") {
                                setCategory("custom");
                            } else {
                                setCategory(value);
                            }
                        }} 
                        MenuProps={selectMenuProps}
                        displayEmpty
                    >
                        <MenuItem value="">Select category</MenuItem>
                        {availableCategories && availableCategories.length > 0 && availableCategories.map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                        <MenuItem value="custom">+ Add new category</MenuItem>
                    </Select>
                </FormControl>
            )}

            <Typography sx={{ ...h7 }} mb={1}>Stock</Typography>
            <TextField fullWidth type="number" value={stock || ""} onChange={(e) => setStock(Number(e.target.value))}  sx={{ ...inputStyles, mb: 2 }} />

            <Typography sx={{ ...h7 }} mb={1}>Price</Typography>
            <TextField fullWidth value={price || ""} onChange={(e) => setPrice(e.target.value)} sx={{ ...inputStyles, mb: 2 }}/>

            {productType !== 'accessory' && (
                <>
                    <Typography sx={{ ...h7 }} mb={1}>Total weight</Typography>
                    <WeightSelectorAdmin weight={weight} setWeight={setWeight}/>
                </>
            )}

            <Typography sx={{ ...h7, mt: 2 }} mb={1}>Description</Typography>
            <TextField multiline  minRows={4} fullWidth
                placeholder="Write a short description highlighting benefits and features"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        height: "auto",
                        borderRadius: "20px",
                        alignItems: "flex-start",
                        "& .MuiOutlinedInput-input": {
                            color: "#000",
                            wordBreak: "break-word",
                            whiteSpace: "pre-wrap",
                        },
                        "&:hover .MuiOutlinedInput-input": { color: "#B88A6E !important" },
                        "&.Mui-focused .MuiOutlinedInput-input": { color: "#A4795B !important" },
                        "&.Mui-error .MuiOutlinedInput-input": { color: "#FF2F2F !important" },
                    },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#3E3027" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#B88A6E !important" },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#A4795B !important" },
                    "& .Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: "#FF2F2F !important" },
                }}
            />
        </Box>
    );
}
