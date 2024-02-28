import { useContext, useEffect, useRef, useState } from "react";
import Loading from "../../../components/Loading";
import Input from "../../../components/input";

import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import Toast from "../../../components/Toast";
import createAxiosInstance from "../../../axios";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ErrorHelper from "../../../helpers/errors";

export default function UpdateProduct() {
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [temporaryImages, setTemporaryImages] = useState([]);
  let { id } = useParams();
  const auth = useContext(AuthContext);
  const axios = createAxiosInstance(auth);
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState([]);
  const [progress, setProgress] = useState(0);
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const attri = useRef(null);
  const [varients, setVarients] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [optionsInput, setOptionsInput] = useState("");
  // const [discount, setdiscount] = useState({
  //   discount : "",
  //   type : "percent",
  //   start_date : formatDate(Date.now()),
  //   end_date : formatDate(Date.now() + + 7 * 24 * 60 * 60 * 1000),
  // });
  const handleVariantChange = (index, fieldName, value) => {
    const updatedVariants = [...varients];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [fieldName]: value,
    };
    setVarients(updatedVariants);
  };
  const handleAddOption = (index, option) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index].options.push(option);
    setAttributes(updatedAttributes);
  };

  const handleAddAttribute = (name) => {
    setAttributes([...attributes, { name: name, options: [] }]);
    attri.current.value = "";
    attri.current.focus();
  };

  const addDiscount = () => {
    axios
      .post("/api/discount", { ...discount, product_id: id })
      .then((response) => {
        console.log(response.data.discount);
        Toast.notifyMessage("success", "discount added");
        setDiscounts([...discounts, response.data.discount]);
      });
  };

  function formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  const [product, setProduct] = useState({
    name: "",
    slug: "",
    smallDescription: "",
    description: "",
    price: "",
    quantity: "",
    images: [],
    tags: [],
    categoryId: 12,
  });

  useEffect(() => {
    if (!id) return navigate("/admin/products");
  }, [id]);

  const fetchProduct = () => {
    axios
      .get(`/admin/products/${id}`)
      .then((response) => {
        const data = response.data;

        setProduct(response.data);
        // setAttributes(Array.from(data.attributes));
        // setVarients(Array.from(data.varients));
        setTemporaryImages(data.images || []);
      })
      .catch((error) => {
        if (error.response.status === 404) {
          Toast.notifyMessage("error", "Product not found");
          return navigate("/admin/dashboard");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setVarients([]);
    const generateVariants = () => {
      if (attributes.length > 0) {
        const combinations = getAllCombinations(attributes);
        const newVariants = combinations.map((combination) => {
          const existingVariant = varients.find((v) =>
            v.options.every(
              (opt, index) => opt.value === combination[index].value
            )
          );

          const variant = {
            price: existingVariant ? existingVariant.price : 0,
            quantity: existingVariant ? existingVariant.quantity : 0,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          axios.get("admin/categories/all"),
          new Promise(resolve => {
            resolve([]);
          }),
        ]);

        setCategories(categoriesResponse.data);

        const tagsFromResponse = tagsResponse.data.data.map((tag) => ({
          value: tag.id,
          label: tag.name,
        }));

        setSuggestions(tagsFromResponse);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    fetchProduct();
    fetchData();
  }, [id, auth.permissions]);

  const deleteDiscount = (id) => {
    if (confirm("are ypu sure you want to delte this discount?")) {
      axios
        .delete(`/api/discount/${id}`)
        .then((response) => {
          Toast.notify("success", response.data[0].message);
        })
        .catch((error) => {
          console.log(error);
          Toast.notifyMessage("error", "an error occur");
        });
    }
  };

  const handleRemoveImage = (image) => {
    setProcessing(true);

    if (image.id !== null) {
      axios
        .post(`/admin/images/delete`, {
          productId: id,
          imageId: image.id,
        })
        .then(() => {
          const updatedTemporaryImages = temporaryImages.filter(
            (img) => img.id !== image.id
          );
          setTemporaryImages(updatedTemporaryImages);
        })
        .catch((error) => {
          console.error("Error deleting image: ", error);
          Toast.notifyMessage("error", "Error deleting image");
        })
        .finally(() => {
          setProcessing(false);
        });
    } else {
      const updatedTemporaryImages = temporaryImages.filter(
        (img) => img.file !== image.file
      );
      setTemporaryImages(updatedTemporaryImages);
    }
  };

  const [errors, setErrors] = useState([]);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);

    if (Array.from(temporaryImages).length + files.length > 5) {
      Toast.notifyMessage(
        "error",
        "you cannot upload more than  images for single product"
      );
      return;
    }

    const formData = new FormData();
    formData.append('ProductId', id);
    files.forEach((file) => {
      formData.append("images", file);
    });

    axios
      .post(`/admin/images`, formData, {
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
      .then((response) => {
        fetchProduct();
      })
      .catch((error) => {
        Toast.notify("error", error.response.data.message);
      })
      .finally(() => {
        setProgress(0);
      });
    event.target.value = "";
  };

  // const handleTagChange = (selectedOptions) => {
  //   setProduct({
  //     ...product,
  //     tags: selectedOptions,
  //   });
  // };

  // function handleDeleteAttributeOption(attributeIndex, optionIndex) {}

  // useEffect(() => {
  //   setProduct({ ...product, slug: product.name.replace(/\s+/g, "-") });
  // }, [product.name]);

  const handleSubmission = async (event) => {
    event.preventDefault();
    setProcessing(true);
    const formData = new FormData();

    formData.append("_method", "PUT");

    for (const key in product) {
      if (key !== "images" && key !== "tags") {
        formData.append(key, product[key]);
      }
    }

    if (product.tags) {
      Array.from(product.tags).map((tag) => {
        formData.append("tags[]", tag.value);
      });
    }

    if (attributes.length > 0) {
      attributes.forEach((attribute) => {
        formData.append("attributes[]", attribute.name);
      });
      varients.forEach((varient, index) => {
        formData.append(`varients[${index}][price]`, varient.price);
        formData.append(`varients[${index}][quantity]`, varient.quantity);

        varient.options.forEach((option, optionIndex) => {
          formData.append(
            `varients[${index}][options][${optionIndex}][name]`,
            option.name
          );
          formData.append(
            `varients[${index}][options][${optionIndex}][value]`,
            option.value
          );
        });
      });
    }

    formData.append("categoryId", product.categoryId);
    axios
      .put(`/admin/products/${id}`, formData, {
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
        console.log("error: ", error);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <>
      {isLoading ? (
        <Loading size="large" />
      ) : (
        <form
          onSubmit={handleSubmission}
          action=""
          className="lg:w-3/4 sm:grid mt-3 rounded shadow-2xl sm:grid-cols-2 sm:gap-3 mx-auto justify-center p-4"
        >
          <h2
            className="text-center font-bold text-3xl text-indigo-600"
            style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
          >
            Product
          </h2>
          <Input
            label="name"
            type="text"
            value={product.name}
            onChange={(event) =>
              setProduct({ ...product, name: event.target.value })
            }
            error={errors?.Name || null}
            placeholder="name"
          />
          <Input
            label="smallDescription"
            type="text"
            value={product.smallDescription}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(event) =>
              setProduct({
                ...product,
                smallDescription: event.target.value,
              })
            }
            error={errors?.SmallDescription || null}
            placeholder="smallDescription"
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
            error={errors?.Description || null}
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
            error={errors?.Price || null}
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
            error={errors?.Quantity || null}
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
              options={suggestions}
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
              htmlFor="countries"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Select an option
            </label>
            <select
              value={product.categoryId}
              onChange={(event) =>
                setProduct({
                  ...product,
                  categoryId: event.target.value,
                })
              }
              id="countries"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option selected>Choose a country</option>
              {categories &&
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id} selected={cat.id == product.categoryId}>
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
            error={errors?.Images || null}
            onChange={handleFileUpload}
            style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
          />
          <div
            className="flex gap-2 flex-wrap w-full"
            style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
          >
            {temporaryImages &&
              temporaryImages.map((image) => (
                <div key={image.id ?? image.name} className="image-container">
                  <img className="w-14 h-14" src={image.name} alt="display" />
                  <FontAwesomeIcon
                    onClick={() => handleRemoveImage(image)}
                    className="text-red-500 cursor-pointer"
                    icon={"fa-trash"}
                  />
                </div>
              ))}
          </div>
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
                              {option}
                              <FontAwesomeIcon
                                onClick={handleDeleteAttributeOption(
                                  index,
                                  optionIndex
                                )}
                                className="text-red-500 cursor-pointer"
                                icon={"fa-trash"}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
            </div>
          </div> */}
          {progress !== 0 && (
            <div
              className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"
              style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
            >
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          <button
            disabled={processing || progress !== 0}
            className="group !bg-indigo-600 disabled:cursor-not-allowed
             disabled:bg-indigo-400 relative py-2 px-4 border border-transparent
              text-sm font-medium rounded-md text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            type="submit"
            style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
          >
            {processing || progress !== 0 ? "Updating..." : "Update Product"}
          </button>
        </form>
      )}
    </>
  );
}
