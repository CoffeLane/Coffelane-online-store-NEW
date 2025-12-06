import React from "react";

export const TabPanel = ({children, value, index}) => (
    <div hidden={value !== index} style={{padding: '32px 0'}}>
        {value === index && children}
    </div>
);