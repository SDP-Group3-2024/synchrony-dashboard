import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const data = [
    { name: 'January', value: 40 },
    { name: 'February', value: 30 },
    { name: 'March', value: 20 },
    { name: 'April', value: 27 },
    { name: 'May', value: 18 },
    { name: 'June', value: 23 },
  ];
  
export function SimpleLineGraph() {
    return (
        <ResponsiveContainer width="100%" height="100%">
        <LineChart
            data={data}
            margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
        </ResponsiveContainer>
    );
}
