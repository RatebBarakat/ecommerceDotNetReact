import React, { Suspense, useEffect, useState } from "react";
import createAxiosInstance from "../axios";
import Loading from "./Loading";

export default function Header() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const axios = createAxiosInstance();

    useEffect(() => {
        axios
            .get("/api/user/category")
            .then((response) => {
                setCategories(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching categories:", error);
                setLoading(false);
            });
    }, []);

    return (
        <Suspense fallback={<Loading />}>
            <div>
                <h1>Header Content</h1>
            </div>
        </Suspense>
    );
}
