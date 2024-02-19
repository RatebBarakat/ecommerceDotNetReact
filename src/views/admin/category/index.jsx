import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { AuthContext } from "../../../contexts/auth";
import Modal from "../../../components/Modal";
import { useNavigate } from "react-router-dom";
import Toast from "../../../components/Toast";
import ErrorHelper from "../../../helpers/errors";
import Input from "../../../components/input";
import Pagination from "../../../components/Pagination";
import "tw-elements-react/dist/css/tw-elements-react.min.css";
import Table from "../../../components/Table";
import createAxiosInstance from "../../../axios";
import { Permission } from "../../../helpers/permissions";
import { debounce } from "lodash";

const getInitialPage = () => {
  let page = new URLSearchParams(location.search).get("page");
  return page !== null && !isNaN(page) && page > 0 ? parseInt(page) : 1;
};

const Categories = () => {
  const axios = createAxiosInstance();
  const auth = useContext(AuthContext);
  const [sort, setSort] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setEditShowModal] = useState(false);
  const [numberofPages, setNumberOfPages] = useState(0);
  const [search, setSearch] = useState(null);

  const [page, setPage] = useState(getInitialPage);

  const [errors, setErrors] = useState({
    add: {},
    edit: {},
  });
  const [form, setForm] = useState({
    name: "",
    slug: "",
  });

  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    slug: "",
  });

  const changePage = ({ selected }) => {
    const newPage = selected + 1;
    setPage(newPage);
    fetchCategories(newPage);
  };

  useEffect(() => {
    setForm({ ...form, slug: form.name.replace(/\s+/g, "-") });
  }, [form.name]);

  useEffect(() => {
    setEditForm({ ...editForm, slug: editForm.name.replace(/\s+/g, "-") });
  }, [editForm.name]);

  useEffect(() => {
    let params = new URLSearchParams(location.search);
    if (search != null) {
      params.set("search", search);
      navigate(`?${params.toString()}`);
    } else {
      params.delete("search");
      navigate(`?${params.toString()}`);
    }

    const delayedFetch = debounce(() => {
      fetchCategories(page, sort);
    }, 300);

    delayedFetch();

    return () => {
      delayedFetch.cancel();
      console.log("search changed finish", search);
    };
  }, [search]);

  useEffect(() => {
    let params = new URLSearchParams(location.search);
    if (page !== 1 && typeof page === "number" && page > 0) {
      params.set("page", page);
      navigate(`?${params.toString()}`);
    } else {
      params.delete("page");
      navigate(`?${params.toString()}`);
    }
  }, [page]);

  useEffect(() => {
    let params = new URLSearchParams(location.search);
    if (sort != null) {
      params.set("sort", sort);
      navigate(`?${params.toString()}`);
      fetchCategories();
    } else {
      params.delete("sort");
      navigate(`?${params.toString()}`);
    }
  }, [sort]);

  const navigate = useNavigate();

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const toggleEditModal = () => {
    setEditShowModal(!showEditModal);
  };

  const resetErrors = () => {
    setErrors({ add: {}, edit: {} });
  };

  const resetInputs = (type) => {
    type == "add"
      ? setForm({ name: "", slug: "" })
      : setEditForm({ name: "", slug: "" });
  };

  const handleSubmit = async () => {
    resetErrors();
    axios
      .post(`/admin/categories`, form)
      .then(() => {
        fetchCategories(1);
        resetInputs("add");
        setPage(1);
        toggleModal();
        Toast.notifyMessage("success", "category added");
      })
      .catch((error) => {
        const addErrors = ErrorHelper.extractErrorMessage(error);
        setErrors({ add: addErrors, edit: {} });
      });
  };

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
            `<span class="highlight">${originalText}</span>`
          );
        }
      });
    };

    if (categories.length > 0 && search !== null && search !== "") {
      highlightSearch();
    }
  }, [categories, search]);

  const openEditForm = (id) => {
    resetErrors();
    axios
      .get(`/admin/categories/${id}`)
      .then((response) => {
        setEditForm(response.data.data);
        toggleEditModal();
      })
      .catch(() => {
        Toast.notifyMessage("an error occur");
      });
  };

  const handleEditSubmit = () => {
    axios
      .put(`/admin/categories/${editForm.id}`, editForm)
      .then(() => {
        fetchCategories(page);
        resetInputs("edit");
        toggleEditModal();
        Toast.notifyMessage("success", "category updated");
      })
      .catch((error) => {
        const editErrors = ErrorHelper.extractErrorMessage(error);
        setErrors({ edit: editErrors, add: {} });
      });
  };

  const handleDelete = (id) => {
    if (!confirm("are you sure you want to delete this category")) {
      return;
    }
    axios
      .delete(`/admin/categories/${id}`)
      .then(() => {
        fetchCategories(1);
        Toast.notifyMessage("success", "category delted");
      })
      .catch((error) => {
        Toast.notifyMessage(
          "error",
          error.response?.data?.message,
          toString() ?? "cant delete"
        );
      });
  };

  const handleSort = useCallback(
    (newSort) => {
      setSort((prevSort) => (prevSort !== newSort ? newSort : null));
    },
    [setSort]
  );

  const handleDeleteMany = () => {
    if (!confirm("are you sure you want to delete selected categories")) {
      return;
    }
    axios
      .post(`/admin/categories/deleteMany`, { ids: Array.from(selected) })
      .then(() => {
        fetchCategories(1);
        Toast.notifyMessage("success", "category delted");
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
      const allIds = categories.map((category) => category.id);
      setSelected(allIds);
    } else {
      setSelected([]);
    }
  };

  const handleCheckboxChange = useCallback(
    (event) => {
      const categoryid = parseInt(event.target.value);
      const isChecked = event.target.checked;

      setSelected((prevSelected) => {
        if (isChecked) {
          return [...prevSelected, categoryid];
        } else {
          return prevSelected.filter((id) => id !== categoryid);
        }
      });
    },
    [setSelected]
  );

  const isSelected = (categoryId) => {
    return selected.includes(categoryId);
  };

  const fetchCategories = useCallback(
    async (forcePage = null) => {
      !isLoading && setIsLoading(true);
      let paginateUrl = "admin/categories";
      let param = new URLSearchParams(location.search);

      forcePage && setPage(forcePage);

      param.set("page", forcePage || page);

      if (sort !== null) {
        param.set("sort", sort);
      }

      paginateUrl += `?${param.toString()}`;

      axios
        .get(paginateUrl)
        .then((response) => {
          setCategories(response.data.data);
          setNumberOfPages(response.data.total);
          setLinks(response.data.meta);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    },
    [page, sort, isLoading, search]
  );

  useEffect(() => {
    if (!Permission.can(auth, "read-categories")) {
      return navigate("/admin/dashboard", {
        replace: true,
      });
    } else {
      let params = new URLSearchParams(location.search);
      params.get("page") ? fetchCategories(page) : fetchCategories();
    }
  }, []);

  const columns = [
    { title: "Name", dataField: "name", sortable: true },
    { title: "Slug", dataField: "slug", sortable: true },
  ];

  return (
    <>
      <div className="container w-screen sm:!w-11/12 mx-auto">
        <div className="flex justify-between">
          <button
            className="inline-block ml-3 rounded mt-3 bg-indigo-600 px-6 pb-2 pt-2.5 text-base font-medium leading-normal text-white"
            onClick={toggleModal}
          >
            Add Category
          </button>
          {selected.length > 0 && (
            <button
              className="inline-block ml-3 rounded mt-3 bg-red-600 px-6 pb-2 pt-2.5 text-base font-medium leading-normal text-white"
              onClick={() => handleDeleteMany()}
            >
              delete selected
            </button>
          )}
        </div>
        <input
          type="search"
          onChange={(event) => setSearch(event.target.value)}
          id="search"
          class="bg-gray-50 border border-gray-300 my-3 text-gray-900 text-sm rounded-lg focus:ring-blue-500
                     focus:border-blue-500 block w-1/4 ml-3 p-2.5 dark:bg-gray-700 dark:border-gray-600
                      dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
                       dark:focus:border-blue-500"
          placeholder="search..."
          required
        />
        <Table
          columns={columns}
          data={categories}
          selected={selected}
          canEdit="update-categories"
          canDelete="delete-categories"
          handleEdit={openEditForm}
          handleDelete={handleDelete}
          handleCheckboxChange={handleCheckboxChange}
          handleSelectAll={handleSelectAll}
          isSelected={isSelected}
          isLoading={isLoading}
          handleSort={handleSort}
        />
        {/* {Object.keys(links).length > 0 && ( */}
          <Pagination
            page={page}
            numberofPages={numberofPages}
            changePage={changePage}
          ></Pagination>
        {/* )} */}
      </div>

      <Modal
        identifier="add"
        errors={errors.add}
        header="add category"
        showModal={showModal}
        toggleModal={toggleModal}
        onSubmit={handleSubmit}
      >
        <Input
          label="name"
          type="text"
          value={form.name}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="name"
        />
        <Input
          label="slug"
          type="text"
          value={form.slug}
          classslug="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
          onChange={(event) => setForm({ ...form, slug: event.target.value })}
          placeholder="country"
        />
      </Modal>

      <Modal
        header="edit category"
        identifier="edit"
        showModal={showEditModal}
        toggleModal={toggleEditModal}
        onSubmit={handleEditSubmit}
        errors={errors.edit}
      >
        <Input
          label="name"
          type="text"
          value={editForm.name}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
          onChange={(event) =>
            setEditForm({ ...editForm, name: event.target.value })
          }
          placeholder="country"
        />

        <Input
          label="slug"
          type="text"
          value={editForm.slug}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
          onChange={(event) =>
            setEditForm({ ...editForm, slug: event.target.value })
          }
          placeholder="country"
        />
      </Modal>
    </>
  );
};

export default Categories;
