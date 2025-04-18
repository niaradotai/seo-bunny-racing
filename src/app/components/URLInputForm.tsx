"use client";

import Image from "next/image";
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import LoadingButton from "./loading-button";

interface URLInputFormProps {
    onUrlsSubmit: (urls: string[]) => void;
    loading?: boolean;
}

type FormValues = {
    urls: { value: string }[];
};

const URLInputForm: React.FC<URLInputFormProps> = ({
    onUrlsSubmit,
    loading,
}) => {

    // Initialize react-hook-form
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            urls: [
                { value: "https://yourwebsite.com" },
                { value: "" },
                { value: "" },
            ],
        },
        mode: "onBlur",
    });

    // Setup field array for managing the URL inputs
    const { fields } = useFieldArray({
        control,
        name: "urls",
    });

    // Handle form submission
    const onSubmit = (data: FormValues) => {
        const filteredUrls = data.urls
            .map((item) => item.value)
            .filter((url) => url !== "");

        // Additional validation for minimum 2 URLs
        if (filteredUrls.length < 2) {
            alert(
                "Please enter at least 2 valid website URLs to start the race!"
            );
            return;
        }

        // Form is valid, submit
        
        onUrlsSubmit(filteredUrls);
    };

    // Label colors for each URL input
    const labelColors = ["text-yellow-300", "text-blue-300", "text-green-300"];

    return (
        <>
            <div className="flex justify-center mb-6">
                <Image
                    src="/assets/logo.png"
                    width={200}
                    height={200}
                    alt="Bunny Racer"
                    className="block"
                />
            </div>
            <div className="max-w-xl w-full mx-auto">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-5 bg-gray-800 bg-opacity-80 p-6 rounded-xl shadow-2xl text-white"
                >
                    <h2 className="text-xl mb-6 text-center">
                        Race your websites based on PageSpeed scores!
                    </h2>

                    {fields.map((field, index) => (
                        <div className="flex flex-col gap-1" key={field.id}>
                            <label
                                htmlFor={`url-${index}`}
                                className={`font-bold ${
                                    labelColors[index] || "text-white"
                                }`}
                            >
                                {index === 0
                                    ? "Your Website"
                                    : `Competitor ${index}`}
                            </label>
                            <div className="flex flex-col w-full">
                                <div className="flex items-center bg-gray-900 rounded overflow-hidden">
                                    <span className="px-3 text-2xl">🐰</span>
                                    <input
                                        type="text"
                                        id={`url-${index}`}
                                        placeholder="https://example.com"
                                        className={`w-full py-2 px-3 bg-gray-900 text-white focus:outline-none ${
                                            errors.urls?.[index]?.value
                                                ? "border border-red-500"
                                                : ""
                                        }`}
                                        {...register(`urls.${index}.value`, {
                                            required:
                                                index <= 1
                                                    ? "This URL is required"
                                                    : false,
                                            validate: (value) => {
                                                // Allow empty values for optional URLs (after the first 2)
                                                if (!value && index > 1)
                                                    return true;

                                                // Simple URL validation
                                                try {
                                                    const url = new URL(value);
                                                    return (
                                                        url.protocol ===
                                                            "http:" ||
                                                        url.protocol ===
                                                            "https:" ||
                                                        "Please enter a valid URL"
                                                    );
                                                } catch {
                                                    return "Please enter a valid URL";
                                                }
                                            },
                                        })}
                                    />
                                </div>
                                {errors.urls?.[index]?.value && (
                                    <div className="text-red-500 text-xs mt-1 pl-4">
                                        {
                                            errors.urls[index]?.value
                                                ?.message as string
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div>
                        <LoadingButton loading={loading} />
                    </div>
                </form>
            </div>
        </>
    );
};

export default URLInputForm;
