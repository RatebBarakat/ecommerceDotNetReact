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

const Tags = () => {
  const axios = createAxiosInstance();
  const auth = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [sort, setSort] = useState(null);
  const [selected, setSelected] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setEditShowModal] = useState(false);
  const [numberofPages, setNumberOfPages] = useState(0);
  const [page, setPage] = useState(getInitialPage);
  const [search, setSearch] = useState(null);
  const [errors, setErrors] = useState({
    add: {},
    edit: {},
  });
  const [form, setForm] = useState({
    name: "",
  });

  const [editForm, setEditForm] = useState({
    id: "",
  });

  const changePage = ({ selected }) => {
    const newPage = selected + 1;
    setPage(newPage);
    fetchTags(newPage);
  };

  const handleSort = useCallback(
    (newSort) => {
      setSort((prevSort) => (prevSort !== newSort ? newSort : null));
    },
    [setSort]
  );

  useEffect(() => {
    let params = new URLSearchParams(location.search);
    if (page != 1) {
      params.set("page", page);
      navigate(`?${params.toString()}`);
    } else {
      params.delete("page");
      navigate(`?${params.toString()}`);
    }
  }, [page]);

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
      fetchTags(page, sort);
    }, 300);

    delayedFetch();

    return () => {
      delayedFetch.cancel();
      console.log("search changed finish", search);
    };
  }, [search]);

  useEffect(() => {
    let params = new URLSearchParams(location.search);
    if (sort != null) {
      params.set("sort", sort);
      navigate(`?${params.toString()}`);
      fetchTags();
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
    type == "add" ? setForm({ name: "" }) : setEditForm({ name: "" });
  };

  const handleSubmit = async () => {
    resetErrors();
    axios
      .post(`/api/tag`, form)
      .then(() => {
        fetchTags(1);
        resetInputs("add");
        setPage(1);
        toggleModal();
        Toast.notifyMessage("success", "tag added");
      })
      .catch((error) => {
        const addErrors = ErrorHelper.extractErrorMessage(error);
        setErrors({ add: addErrors, edit: {} });
      });
  };

  const openEditForm = (id) => {
    resetErrors();
    axios
      .get(`/api/tag/${id}`)
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
      .put(`/api/tag/${editForm.id}`, editForm)
      .then(() => {
        fetchTags(page);
        resetInputs("edit");
        toggleEditModal();
        Toast.notifyMessage("success", "tag updated");
      })
      .catch((error) => {
        const editErrors = ErrorHelper.extractErrorMessage(error);
        setErrors({ edit: editErrors, add: {} });
      });
  };

  const handleDelete = (id) => {
    if (!confirm("are you sure you want to delete this tag")) {
      return;
    }
    axios
      .delete(`/api/tag/${id}`)
      .then(() => {
        fetchTags(1);
        Toast.notifyMessage("success", "tag delted");
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
    if (!confirm("are you sure you want to delete selected tags")) {
      return;
    }
    axios
      .post(`/api/tag/deleteMany`, { ids: Array.from(selected) })
      .then(() => {
        fetchTags(1);
        Toast.notifyMessage("success", "tag delted");
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

    if (tags.length > 0 && search !== null && search !== "") {
      highlightSearch();
    }
  }, [tags, search]);

  const handleSelectAll = (event) => {
    const selectedAll = event.target.checked;
    if (selectedAll) {
      const allIds = tags.map((tag) => tag.id);
      setSelected(allIds);
    } else {
      setSelected([]);
    }
  };

  const handleCheckboxChange = useCallback(
    (event) => {
      const productId = parseInt(event.target.value);
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

  const isSelected = (tagId) => {
    return selected.includes(tagId);
  };

  const fetchTags = useCallback(
    async (forcePage = null) => {
      !isLoading && setIsLoading(true);
      let paginateUrl = "api/tag";
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
          setTags(response.data.data);
          setNumberOfPages(response.data.meta.last_page);
          setLinks(response.data.meta);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    },
    [page, sort]
  );

  useEffect(() => {
    if (!Permission.can(auth, "read-tags")) {
      return navigate("/admin/dashboard", {
        replace: true,
      });
    } else {
      let params = new URLSearchParams(location.search);
      !tags.length < 1 && params.get("page") !== 1
        ? fetchTags(page)
        : fetchTags();
    }
  }, [auth.permissions]);

  const columns = [{ title: "Name", dataField: "name", sortable: true }];

  return (
    <>
      <div className="container w-screen sm:!w-11/12 mx-auto">
        <div className="flex justify-between">
          <button
            className="inline-block ml-3 rounded mt-3 bg-indigo-600 px-6 pb-2 pt-2.5 text-base font-medium leading-normal text-white"
            onClick={toggleModal}
          >
            Add tag
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
          data={tags}
          selected={selected}
          canEdit="update-tags"
          canDelete="delete-tags"
          handleEdit={openEditForm}
          handleDelete={handleDelete}
          handleCheckboxChange={handleCheckboxChange}
          handleSelectAll={handleSelectAll}
          isSelected={isSelected}
          isLoading={isLoading}
          handleSort={handleSort}
        />
        {Object.keys(links).length > 0 && (
          <Pagination
            page={page}
            numberofPages={numberofPages}
            changePage={changePage}
          ></Pagination>
        )}
      </div>

      <Modal
        identifier="add"
        errors={errors.add}
        header="add tag"
        showModal={showModal}
        toggleModal={toggleModal}
        onSubmit={handleSubmit}
      >
        <Input
          label="name"
          type="text"
          value={form.name}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="name"
        />
      </Modal>
      <Modal
        header="edit tag"
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
      </Modal>
    </>
  );
};

export default Tags;
