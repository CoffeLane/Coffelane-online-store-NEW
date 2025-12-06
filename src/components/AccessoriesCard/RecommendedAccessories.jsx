import React from "react";
import { Box, Typography } from "@mui/material";
import { h3 } from '../../styles/typographyStyles.jsx';
import AccessoriesCardData from '../../components/Accessories/AccessoriesCardData.jsx'



export default function RecommendedProducts({ products }) {

 if (!products || products.length === 0) return null;


    return (
        <Box>
            <Typography sx={{ ...h3, textAlign: 'center', mb: 4 }}>
                You also might like
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3,  mb: 4 }}>
                <AccessoriesCardData products={products} />
            </Box>
        </Box>
    )
}