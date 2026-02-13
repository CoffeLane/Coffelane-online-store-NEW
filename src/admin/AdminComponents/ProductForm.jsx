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
    caffeineType, setCaffeineType,
    servingType, setServingType,
    productType = 'product',
    availableCategories = [], 
}) {
    const isCustomCategory = category === "custom" || (category && !availableCategories.includes(category));

    return (
        <Box sx={{ mt: 3 }}>
            <Typography sx={{ ...h7 }} mb={1}>Product Name</Typography>
            <TextField 
                fullWidth 
                value={productName || ""}  
                onChange={(e) => setProductName(e.target.value)} 
                sx={{ ...inputStyles, mb: 2 }}
                placeholder="Enter product name"
            />

            <Typography sx={{ ...h7 }} mb={1}>Category</Typography>
            {isCustomCategory ? (
                <TextField 
                    fullWidth 
                    value={category === "custom" ? "" : category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    sx={{ ...inputStyles, mb: 2 }}
                    placeholder="Enter new category name..."
                    autoFocus
                    helperText="Type the name. Clear the field to return to the selection list."
                />
            ) : (
                <FormControl fullWidth sx={{ ...h6, ...inputDropdown, ...inputStyles, mb: 2 }}>
                    <Select 
                        value={category || ""} 
                        onChange={(e) => setCategory(e.target.value)} 
                        MenuProps={selectMenuProps}
                        displayEmpty
                    >
                        <MenuItem value="">Select category</MenuItem>
                        {availableCategories.map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                        <MenuItem value="custom" sx={{ fontStyle: 'italic', color: '#A4795B' }}>
                            + Add new category
                        </MenuItem>
                    </Select>
                </FormControl>
            )}

            {productType !== 'accessory' && (
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ ...h7 }} mb={1}>Caffeine Type</Typography>
                        <FormControl fullWidth sx={{ ...inputDropdown, ...inputStyles }}>
                            <Select 
                                value={caffeineType || "Caffeine"} 
                                onChange={(e) => setCaffeineType(e.target.value)}
                                MenuProps={selectMenuProps}
                            >
                                <MenuItem value="Caffeine">Caffeine</MenuItem>
                                <MenuItem value="Caffeine Medium">Caffeine Medium</MenuItem>
                                <MenuItem value="Decaffeinated">Decaffeinated</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ ...h7 }} mb={1}>Serving Type</Typography>
                        <FormControl fullWidth sx={{ ...inputDropdown, ...inputStyles }}>
                            <Select 
                                value={servingType || "Ground"} 
                                onChange={(e) => setServingType(e.target.value)}
                                MenuProps={selectMenuProps}
                            >
                                <MenuItem value="Ground">Ground</MenuItem>
                                <MenuItem value="In grains">In grains</MenuItem>
                                <MenuItem value="Soluble">Soluble</MenuItem>
                                <MenuItem value="In capsules">In capsules</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            )}

            <Typography sx={{ ...h7 }} mb={1}>Stock (Quantity)</Typography>
            <TextField 
                fullWidth 
                type="number" 
                value={stock === null ? "" : stock} 
                onChange={(e) => setStock(e.target.value === "" ? null : Number(e.target.value))}  
                sx={{ ...inputStyles, mb: 2 }} 
                placeholder="0"
            />

            <Typography sx={{ ...h7 }} mb={1}>Price</Typography>
            <TextField 
                fullWidth 
                value={price || ""} 
                onChange={(e) => setPrice(e.target.value)} 
                sx={{ ...inputStyles, mb: 2 }}
                placeholder="0.00"
            />

            {productType !== 'accessory' && (
                <Box mb={2}>
                    <Typography sx={{ ...h7 }} mb={1}>Total Weight</Typography>
                    <WeightSelectorAdmin weight={weight} setWeight={setWeight}/>
                </Box>
            )}

            <Typography sx={{ ...h7, mt: 2 }} mb={1}>Description</Typography>
            <TextField 
                multiline  
                minRows={4} 
                fullWidth
                placeholder="Write a short description highlighting benefits and features"
                value={description || ""}
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
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#B88A6E" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#A4795B" },
                    },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#3E3027" },
                }}
            />
        </Box>
    );
}