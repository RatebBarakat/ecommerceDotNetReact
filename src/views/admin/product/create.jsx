import React, { useContext, useEffect, useRef, useState } from "react";
import Loading from "../../../components/Loading";
import Input from "../../../components/input";

import createAxiosInstance from "../../../axios";
import { AuthContext } from "../../../contexts/auth";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import ErrorHelper from "../../../helpers/errors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function CreateProduct() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [categories, setCategories] = useState([]);
  const auth = useContext(AuthContext);
  const axios = createAxiosInstance(auth);
  const navigate = useNavigate();
  const attri = useRef(null);
  const optionsRefs = useRef([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [product, setProduct] = useState({
    name: "",
    slug: "",
    smallDescription: "",
    description: "",
    price: "",
    quantity: "",
    Images: [],
    categoryId: 0,
    tags: [],
    options: [],
  });
  const [varients, setVarients] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [optionsInput, setOptionsInput] = useState("");

  const handleAddOption = (index, option) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index].options.push(option);
    setAttributes(updatedAttributes);

    const newOptionIndex = updatedAttributes[index].options.length - 1;
    console.log(optionsRefs);
    optionsRefs.current[index].current.value = "";
    optionsRefs.current[index].current.focus();
  };

  const handleAddAttribute = (name) => {
    setAttributes([...attributes, { name: name, options: [] }]);
    attri.current.value = "";
    attri.current.focus();
    optionsRefs.current.push(React.createRef());
  };

  useEffect(() => {
    axios
      .get("admin/categories/all")
      .then((response) => {
        setCategories(response.data);
        // axios.get("/api/tag?type=all").then((response) => {
        //   const tagsFromResponse = response.data.data.map((tag) => ({
        //     value: tag.id,
        //     label: tag.name,
        //   }));
        //   setTagSuggestions(tagsFromResponse);
        // });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    setProduct({ ...product, slug: product.name.replace(/\s+/g, "-") });
  }, [product.name]);

  useEffect(() => {
    setVarients([]);
    const generateVariants = () => {
      if (attributes.length > 0) {
        const combinations = getAllCombinations(attributes);
        console.log(combinations);
        const newVariants = combinations.map((combination) => {
          const variant = {
            price: 0,
            quantity: 0,
            options: combination.map((attr) => ({
              name: attr.name,
              value: attr.value,
            })),
          };
          return variant;
        });
        setVarients(newVariants);
      } else {
        setVarients([]);
      }
    };

    generateVariants();
  }, [attributes]);

  const handleVariantChange = (index, fieldName, value) => {
    const updatedVariants = [...varients];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [fieldName]: value,
    };
    setVarients(updatedVariants);
  };

  const getAllCombinations = (attributes) => {
    const result = [[]];

    const generateCombinations = (index, combination) => {
      if (index === attributes.length) {
        result.push(combination);
        return;
      }

      const { name, options } = attributes[index];

      options.forEach((option) => {
        const newCombination = [...combination, { name: name, value: option }];
        generateCombinations(index + 1, newCombination);
      });
    };

    generateCombinations(0, []);

    const uniqueCombinations = result.slice(1).filter((combination) => {
      const uniqueNames = new Set(combination.map((attr) => attr.name));
      return uniqueNames.size === combination.length;
    });

    return uniqueCombinations;
  };

  const handleFileUpload = (event) => {
    setProduct({ ...product, Images: event.target.files });
  };

  const [errors, setErrors] = useState([]);

  const handleTagChange = (selectedOptions) => {
    setProduct({
      ...product,
      tags: selectedOptions,
    });
  };

  const handleSubmission = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    for (const key in product) {
      if (key !== "Images") {
        formData.append(key, product[key]);
      }
    }

    // if (attributes.length > 0) {
    //   attributes.forEach((attribute) => {
    //     formData.append("attributes[]", attribute.name);
    //   });
    //   varients.forEach((varient, index) => {
    //     formData.append(`varients[${index}][price]`, varient.price);
    //     formData.append(`varients[${index}][quantity]`, varient.quantity);

    //     varient.options.forEach((option, optionIndex) => {
    //       formData.append(
    //         `varients[${index}][options][${optionIndex}][name]`,
    //         option.name
    //       );
    //       formData.append(
    //         `varients[${index}][options][${optionIndex}][value]`,
    //         option.value
    //       );
    //     });
    //   });
    // }

    if (product.Images) {
      Array.from(product.Images).map((image) => {
        formData.append("Images", image);
      });
    }

    // if (product.tags) {
    //   Array.from(product.tags).map((tag) => {
    //     formData.append("tags[]", tag.value);
    //   });
    // }

    axios
      .post("/admin/products", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        navigate("/admin/products");
      })
      .catch((error) => {
        let errorFromRequest = ErrorHelper.extractErrorMessage(error);
        errorFromRequest && setErrors(errorFromRequest);
      })
      .finally(() => {
        setProgress(0);
      });
  };

  return (
    <>
      {isLoading ? (
        <Loading size="large" />
      ) : (
        <>
          <div
            action=""
            className="lg:!w-3/4 sm:grid mt-3 rounded shadow-2xl sm:grid-cols-2 sm:gap-3 mx-auto justify-center p-4"
          >
            <h2
              className="text-center font-bold text-3xl text-indigo-600"
              style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
            >
              product
            </h2>
            <Input
              label="name"
              type="text"
              value={product.name}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(event) =>
                setProduct({
                  ...product,
                  name: event.target.value,
                })
              }
              error={errors?.name || null}
              placeholder="name"
            />
            <Input
              label="slug"
              type="text"
              value={product.slug}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(event) =>
                setProduct({
                  ...product,
                  slug: event.target.value,
                })
              }
              error={errors?.slug || null}
              placeholder="slug"
            />
            <Input
              label="small_description"
              type="text"
              value={product.small_description}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(event) =>
                setProduct({
                  ...product,
                  smallDescription: event.target.value,
                })
              }
              error={errors?.small_description || null}
              placeholder="small description"
            />
            <Input
              label="description"
              type="text"
              value={product.description}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(event) =>
                setProduct({
                  ...product,
                  description: event.target.value,
                })
              }
              error={errors?.description || null}
              placeholder="description"
            />
            <Input
              label="price"
              type="number"
              value={product.price}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(event) =>
                setProduct({
                  ...product,
                  price: event.target.value,
                })
              }
              error={errors?.price || null}
              placeholder="price"
            />
            <Input
              label="quantity"
              type="number"
              value={product.quantity}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(event) =>
                setProduct({
                  ...product,
                  quantity: event.target.value,
                })
              }
              error={errors?.quantity || null}
              placeholder="quantity"
            />
            {/* <div>
              <label
                htmlFor="tags"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Select tags
              </label>
              <Select
                isMulti
                options={tagSuggestions}
                value={product.tags}
                onChange={handleTagChange}
                styles={{
                  control: (styles) => ({
                    ...styles,
                    borderRadius: "0.375rem",
                    border: "1px solid #D1D5DB",
                  }),
                  multiValueLabel: (styles) => ({
                    ...styles,
                    color: "white",
                  }),
                  multiValue: (styles) => ({
                    ...styles,
                    borderRadius: "0.375rem",
                    backgroundColor: "#4f46e5",
                    color: "white",
                    margin: "2px",
                    padding: "2px 4px",
                  }),
                }}
              />
            </div> */}
            <div>
              <label
                htmlFor="categories"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Select a category
              </label>
              <select
                value={product.categoryId}
                onChange={(event) =>
                  setProduct({
                    ...product,
                    categoryId: event.target.value,
                  })
                }
                id="categories"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option selected>Choose a category</option>
                {categories &&
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
            <Input
              label="images"
              type="file"
              name="file"
              multiple={true}
              error={errors?.images || null}
              onChange={handleFileUpload}
              // style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
            />
            {progress !== 0 && (
              <div
                className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"
                style={{
                  gridColumnStart: "1",
                  gridColumnEnd: "3",
                }}
              >
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{
                    width: `${progress}%`,
                    gridColumnStart: "1",
                    gridColumnEnd: "3",
                  }}
                ></div>
              </div>
            )}
            {/* <div
              style={{
                gridColumnStart: "1",
                gridColumnEnd: "3",
              }}
            >
              <div>
                <h3 className="text-lg font-semibold mb-2 w-full">
                  Product Options
                </h3>
                <input
                  type="text"
                  className="bg-gray-50 focus:outline-none border-2
                                          focus:border-indigo-600 text-gray-900 text-sm rounded-lg block w-full p-2.5
                                            border-grey-300 placeholder-gray-400 dark:text-white mb-2"
                  ref={attri}
                  placeholder="attribute name"
                />
                <button
                  type="button"
                  onClick={() => handleAddAttribute(attri.current.value)}
                  className="group mb-2 disabled:cursor-not-allowed disabled:!bg-indigo-400 relative py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white !bg-indigo-600 hover:!bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Attribute
                </button>
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full"
                style={{
                  gridColumnStart: "1",
                  gridColumnEnd: "3",
                }}
              >
                {attributes &&
                  attributes.map((attribute, index) => (
                    <div key={index}>
                      <div className="border border-indigo-500 rounded p-2 text-indigo-500">
                        {attribute.name}
                      </div>
                      <div className="">
                        <div className="flex gap-2 my-2 justify-center">
                          <input
                            type="text"
                            value={optionsInput}
                            ref={optionsRefs}
                            onChange={(e) => setOptionsInput(e.target.value)}
                            placeholder="Enter option"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleAddOption(index, optionsInput);
                              setOptionsInput("");
                            }}
                            className="group whitespace-nowrap disabled:cursor-not-allowed disabled:!bg-indigo-400 relative py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white !bg-indigo-600 hover:!bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Add Option
                          </button>
                        </div>
                        {attribute.options && (
                          <div className="flex gap-2">
                            {attribute.options.map((option, optionIndex) => (
                              <div
                                className="border border-blue-500 rounded p-2 text-blue-500 w-fit"
                                key={optionIndex}
                              >
                                {option} <FontAwesomeIcon icon={"fa-trash"} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              {varients && (
                <>
                  <div
                    className="flex flex-wrap gap-2 w-full"
                    style={{
                      gridColumnStart: "1",
                      gridColumnEnd: "3",
                    }}
                  >
                    {varients.map((item, index) => (
                      <div className="shadow p-2 ">
                        <Input
                          label="price"
                          onChange={(e) =>
                            handleVariantChange(index, "price", e.target.value)
                          }
                          value={item.price}
                        />
                        <Input
                          label="quantity"
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          value={item.quantity}
                        />
                        {item.options.map((option) => (
                          <p>
                            {option.name} : {option.value}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div> */}
            <button
              disabled={progress !== 0}
              onClick={handleSubmission}
              className="group disabled:cursor-not-allowed disabled:!bg-indigo-400 relative py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white !bg-indigo-600 hover:!bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              type="submit"
              style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
            >
              submit
            </button>
          </div>
        </>
      )}
    </>
  );
}
