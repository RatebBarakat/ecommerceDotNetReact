import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { AuthContext } from "../../../contexts/auth";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../../components/Toast";
import Pagination from "../../../components/Pagination";
import "tw-elements-react/dist/css/tw-elements-react.min.css";
import Table from "../../../components/Table";
import createAxiosInstance from "../../../axios";
import { Permission } from "../../../helpers/permissions";
import debounce from "lodash/debounce";
import Select from "react-select";

const Products = () => {
  const getInitialPage = () => {
    let page = new URLSearchParams(location.search).get("page");
    return page !== null && !isNaN(page) && page > 0 ? parseInt(page) : 1;
  };
  const [categoryFilter, setcategoryFilter] = useState(null);
  const [categories, setCategories] = useState([]);
  const auth = useContext(AuthContext);
  const axios = createAxiosInstance(auth);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [sort, setSort] = useState(null);
  const [sortOrder, setSortOrder] = useState("DESC");
  const [search, setSearch] = useState(null);
  const [hasVarients, setHasVarients] = useState(null);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [numberofPages, setNumberOfPages] = useState(0);
  const [page, setPage] = useState(getInitialPage());
  // const [perPage, setPerPage] = useState(0);

  const changePage = ({ selected }) => {
    const newPage = selected + 1;
    setPage(newPage);
    fetchProducts(newPage);
  };

  const navigate = useNavigate();

  useLayoutEffect(() => {
    const highlightSearch = () => {
      const searchText = search ? search.toLowerCase() : "";
      document.querySelectorAll("table tbody tr td").forEach((element) => {
        const cellText = element.textContent.toLowerCase();
        const index = cellText.indexOf(searchText);
        if (index !== -1) {
          const originalText = element.textContent.substr(index, search.length);
          element.innerHTML = element.textContent.replace(
            new RegExp(originalText, "i"),
            `<span className="highlight">${originalText}</span>`
          );
        }
      });
    };

    if (products.length > 0 && search !== null && search !== "") {
      highlightSearch();
    }
  }, [products, search]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (search !== null && search.trim() !== "") {
      params.set("search", search.trim());
    }

    if (categoryFilter !== null) {
      params.set("categoryFilter", categoryFilter);
    }

    if (hasVarients !== null) {
      params.set("hasVarients", hasVarients);
    }

    if (sort !== null) {
      params.set("sort", sort);
      params.set("order", sortOrder === "DESC" ? "ASC" : "DESC");
    }

    return params.toString();
  };

  useEffect(() => {
    const queryParams = buildQueryParams();
    navigate(`?${queryParams}`);
    const delayedFetch = debounce(() => {
      fetchProducts();
    }, 300);

    delayedFetch();
  }, [search, categoryFilter, hasVarients, sort, sortOrder]);

  // useEffect(() => {
  //     let params = new URLSearchParams(location.search);
  //     if (search != null) {
  //         params.set("search", search);
  //         navigate(`?${params.toString()}`);
  //     } else {
  //         params.delete("search");
  //         navigate(`?${params.toString()}`);
  //     }

  //     const delayedFetch = debounce(() => {
  //         fetchProducts(page, sort);
  //     }, 300);
  //     search != "" && document.querySelectorAll("table tbody tr td").forEach((element) => {
  //         if (element.textContent.includes(search)) {
  //             element.innerHTML = element.textContent.replace(
  //                 search,
  //                 '<span className="highlight">' + search + "</span>"
  //             );
  //         }
  //     })
  //     delayedFetch();
  //     return () => {
  //         delayedFetch.cancel();
  //         console.log("search changed finish", search);
  //     };
  // }, [search]);
  // useEffect(() => {
  //     let params = new URLSearchParams(location.search);
  //     if (categoryFilter != null) {
  //         params.set("categoryFilter", categoryFilter);
  //         navigate(`?${params.toString()}`);
  //     } else {
  //         params.delete("categoryFilter");
  //         navigate(`?${params.toString()}`);
  //     }

  //     fetchProducts(page, sort);

  //     return () => {
  //         console.log("categoryFilter changed finish", categoryFilter);
  //     };
  // }, [categoryFilter]);
  // useEffect(() => {
  //     let params = new URLSearchParams(location.search);
  //     if (hasVarients != null) {
  //         params.set("hasVarients", hasVarients);
  //         navigate(`?${params.toString()}`);
  //     } else {
  //         params.delete("hasVarients");
  //         navigate(`?${params.toString()}`);
  //     }
  //     fetchProducts(page, sort);

  //     return () => {
  //         console.log("hasVarient changed finish", hasVarients);
  //     };
  // }, [hasVarients]);
  // useEffect(() => {
  //     let params = new URLSearchParams(location.search);
  //     if (page !== 1 && typeof page === "number" && page > 0) {
  //         params.set("page", page);
  //         navigate(`?${params.toString()}`);
  //     } else {
  //         params.delete("page");
  //         navigate(`?${params.toString()}`);
  //     }

  //     return console.log("page changed finish", page);
  // }, [page]);

  useEffect(() => {
    let params = new URLSearchParams(location.search);
    if (sort != null) {
      params.set("sort", sort);
      navigate(`?${params.toString()}`);
    } else {
      params.delete("sort");
      navigate(`?${params.toString()}`);
    }
    setSortOrder(sortOrder == "DESC" ? "ASC" : "DESC");
    params.set("order", sortOrder == "DESC" ? "ASC" : "DESC");
    return console.log("sort changed finish", sort);
  }, [sort]);

  const handleDelete = (id) => {
    if (!confirm("are you sure you want to delete this product")) {
      return;
    }
    axios
      .delete(`/admin/products/${id}`)
      .then(() => {
        fetchProducts(1);
        Toast.notifyMessage("success", "product delted");
      })
      .catch((error) => {
        Toast.notifyMessage(
          "error",
          error.response?.data?.message,
          toString() ?? "cant delete"
        );
      });
  };

  const handleDeleteMany = () => {
    if (!confirm("are you sure you want to delete selected products")) {
      return;
    }
    console.log("selected :>> ", selected);
    axios
      .post(`/admin/products/deleteMany`, { ids: Array.from(selected) })
      .then(() => {
        setSelected([]);
        fetchProducts(1);
        Toast.notifyMessage("success", "products delted");
      })
      .catch((error) => {
        Toast.notifyMessage(
          "error",
          error.response?.data?.message,
          toString() ?? "cant delete"
        );
      })
      .finally(() => {
        setSelected([]);
      });
  };

  const handleSelectAll = (event) => {
    const selectedAll = event.target.checked;
    if (selectedAll) {
      const allIds = products.map((product) => product.id);
      setSelected(allIds);
    } else {
      setSelected([]);
    }
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    let form = new FormData();
    form.append("file", file);

    axios
      .post("/admin/products/import", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        fetchProducts();
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      })
      .finally(() => {
        e.target.value = "";
      });
  };

  const handleCheckboxChange = useCallback(
    (event) => {
      const productId = parseInt(event.target.value);
      console.log("productId :>> ", productId);
      const isChecked = event.target.checked;

      setSelected((prevSelected) => {
        if (isChecked) {
          return [...prevSelected, productId];
        } else {
          return prevSelected.filter((id) => id !== productId);
        }
      });
    },
    [setSelected]
  );

  const isSelected = (productId) => {
    return selected.includes(productId);
  };

  const handleSort = (newSort) => {
    setSort((prevSort) => (prevSort !== newSort ? newSort : null));
    fetchProducts(page, newSort);
  };

  const handleEdit = (id) => {
    navigate(`/admin/products/edit/${id}`);
  };

  const fetchProducts = async (forcePage = null, sort = null) => {
    !isLoading && setIsLoading(true);
    let paginateUrl = "admin/products";
    let param = new URLSearchParams(location.search);

    forcePage && setPage(forcePage);

    param.set("page", forcePage || page);

    if (sort !== null) {
      param.set("sort", sort);
    }

    if (hasVarients !== null) {
      param.set("hasVarients", hasVarients);
    }

    param.set("order", sortOrder);

    if (search != null) {
      param.set("search", search);
    }

    if (categoryFilter != null) {
      param.set("categoryFilter", categoryFilter);
    }

    paginateUrl += `?${param.toString()}`;
    axios
      .get(paginateUrl)
      .then((response) => {
        console.log("response.data.data :>> ", response.data);
        setProducts(response.data.data);
        setNumberOfPages(response.data.total);
        setLinks(response.data.meta);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const CheckPoducts = async () => {
      if (products.length == 0) {
        await fetchProducts();
      }
    };
    if (!Permission.can(auth, "read-products")) {
      return navigate("/admin/dashboard", {
        replace: true,
      });
    } else {
      CheckPoducts();
      axios.get("admin/categories/all").then((response) => {
        let categoriesResponse = response.data.map((category) => ({
          value: category.id,
          label: category.name,
        }));
        categoriesResponse.unshift({
          value: null,
          label: "select to filter",
        });

        setCategories(categoriesResponse);
      });
    }

    return () => {
      console.log("Products component unmounted");
    };
  }, []);

  const columns = [
    { title: "Name", dataField: "name", sortable: true },
    { title: "Slug", dataField: "slug", sortable: true },
    {
      title: "Small Description",
      dataField: "small_description",
      sortable: true,
    },
    { title: "Description", dataField: "description", sortable: true },
    { title: "Price", dataField: "price", sortable: true },
    { title: "Quantity", dataField: "quantity", sortable: true },
    {
      title: "First Image",
      dataField: "image",
      type: "image",
      sortable: false,
    },
    {
      title: "Category",
      dataField: "category.name",
      type: "array",
      sortable: false,
    },
    { title: "Tags", dataField: "tags", sortable: false },
  ];

  return (
    <>
      <div className="container w-screen sm:!w-11/12 mx-auto">
        <div className="flex justify-between">
          <Link
            to="/admin/products/create"
            className="inline-block ml-3 rounded mt-3 bg-indigo-600 px-6 pb-2 pt-2.5 text-base font-medium leading-normal text-white"
          >
            Add product
          </Link>
          <input
            type="file"
            placeholder="import from excel"
            className="inline-block ml-3 rounded mt-3 bg-indigo-600 px-6 pb-2 pt-2.5 text-base font-medium leading-normal text-white"
            onChange={importFromExcel}
          />
          {selected.length > 0 && (
            <button
              className="inline-block ml-3 rounded mt-3 bg-red-600 px-6 pb-2 pt-2.5 text-base font-medium leading-normal text-white"
              onClick={() => handleDeleteMany()}
            >
              delete selected
            </button>
          )}
        </div>
        <div className="flex gap-1 content-between items-center">
          <input
            type="search"
            name="search-product"
            onChange={(event) => setSearch(event.target.value)}
            className="bg-gray-50 border border-gray-300 my-3 text-gray-900 text-sm rounded-lg focus:ring-blue-500
                     focus:border-blue-500 block w-1/4 ml-3 p-2.5 dark:bg-gray-700 dark:border-gray-600
                      dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
                       dark:focus:border-blue-500"
            placeholder="search..."
          />
          <Select
            className=""
            options={categories}
            isSearchable={true}
            onChange={(event) => setcategoryFilter(event.value)}
            styles={{
              control: (styles) => ({
                ...styles,
                borderRadius: "0.375rem",
                borderColor: "#4f46e5",
              }),
              option: (styles, { isSelected }) => ({
                ...styles,
                backgroundColor: isSelected ? "#4f46e5" : "white",
                "&:hover": {
                  backgroundColor: "#4f46e5",
                  color: "white",
                },
              }),
            }}
          />

          {/* <select
            id="countries"
            className="bg-gray-50 border border-gray-300 text-gray-900 w-1/4 h-fit text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(event) => setHasVarients(event.target.value)}
          >
            <option value="">has varients</option>
            <option value="yes">yes</option>
            <option value="no">no</option>
          </select> */}
        </div>
        <Table
          columns={columns}
          data={products}
          selected={selected}
          canEdit="update-products"
          canDelete="delete-products"
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleCheckboxChange={handleCheckboxChange}
          handleSelectAll={handleSelectAll}
          isSelected={isSelected}
          isLoading={isLoading}
          handleSort={handleSort}
        />
        <Pagination
          page={page}
          numberofPages={numberofPages}
          changePage={changePage}
        ></Pagination>
      </div>
    </>
  );
};

export default Products;
