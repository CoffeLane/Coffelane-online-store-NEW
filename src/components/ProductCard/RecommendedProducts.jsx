import React from "react";
import { Box, Typography } from "@mui/material";
import { h3 } from '../../styles/typographyStyles.jsx';
import CoffeeCardData from '../../components/Coffe/CoffeeCardData.jsx'



export default function RecommendedProducts({ products }) {
 if (!products || products.length === 0) return null;



    return (
        <Box>
            <Typography sx={{ ...h3, textAlign: 'center', mb: 4 }}>
                You also might like
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3,  mb: 4 }}>
                <CoffeeCardData products={products} />
            </Box>
        </Box>


    )
}