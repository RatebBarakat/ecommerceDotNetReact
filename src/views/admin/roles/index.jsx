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

const Roles = () => {
  const axios = createAxiosInstance();
  const auth = useContext(AuthContext);
  const [sort, setSort] = useState(null);
  const [roles, setroles] = useState([]);
  const [allPermissions, setAllPermissons] = useState([]);
  const [roleSync, setRoleSync] = useState({
    id: 0,
    permissions: [],
  });
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setEditShowModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [numberofPages, setNumberOfPages] = useState(0);
  const [search, setSearch] = useState(null);

  const [page, setPage] = useState(getInitialPage);

  const [errors, setErrors] = useState({
    add: {},
    edit: {},
  });
  const [form, setForm] = useState({
    name: "",
  });

  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
  });

  const changePage = ({ selected }) => {
    const newPage = selected + 1;
    setPage(newPage);
    fetchRoles(newPage);
  };

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
      fetchRoles(page, sort);
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
      fetchRoles();
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

  const toggleSyncModal = () => {
    setShowSyncModal(!showSyncModal);
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
      .post(`/admin/roles`, { Name: form.name })
      .then(() => {
        fetchRoles(1);
        resetInputs("add");
        setPage(1);
        toggleModal();
        Toast.notifyMessage("success", "role added");
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
            `<span className="highlight">${originalText}</span>`
          );
        }
      });
    };

    if (roles.length > 0 && search !== null && search !== "") {
      highlightSearch();
    }
  }, [roles, search]);

  const openEditForm = (id) => {
    resetErrors();
    axios
      .get(`/admin/roles/${id}`)
      .then((response) => {
        setEditForm(response.data);
        toggleEditModal();
      })
      .catch(() => {
        Toast.notifyMessage("an error occur");
      });
  };

  const handleEditSubmit = () => {
    axios
      .put(`/admin/roles/${editForm.id}`, {
        Name: editForm.name,
      })
      .then(() => {
        fetchRoles(page);
        resetInputs("edit");
        toggleEditModal();
        Toast.notifyMessage("success", "role updated");
      })
      .catch((error) => {
        const editErrors = ErrorHelper.extractErrorMessage(error);
        setErrors({ edit: editErrors, add: {} });
      });
  };

  const handleDelete = (id) => {
    if (!confirm("are you sure you want to delete this role")) {
      return;
    }
    axios
      .delete(`/admin/roles/${id}`)
      .then(() => {
        fetchRoles(1);
        Toast.notifyMessage("success", "role delted");
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
    if (!confirm("are you sure you want to delete selected roles")) {
      return;
    }
    axios
      .post(`/admin/roles/deleteMany`, { ids: Array.from(selected) })
      .then(() => {
        fetchRoles(1);
        Toast.notifyMessage("success", "role delted");
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
      const allIds = roles.map((role) => role.id);
      setSelected(allIds);
    } else {
      setSelected([]);
    }
  };

  const handleCheckboxChange = useCallback(
    (event) => {
      const roleid = parseInt(event.target.value);
      const isChecked = event.target.checked;

      setSelected((prevSelected) => {
        if (isChecked) {
          return [...prevSelected, roleid];
        } else {
          return prevSelected.filter((id) => id !== roleid);
        }
      });
    },
    [setSelected]
  );

  const isSelected = (roleId) => {
    return selected.includes(roleId);
  };

  const fetchRoles = useCallback(
    async (forcePage = null) => {
      !isLoading && setIsLoading(true);
      let paginateUrl = "admin/roles";
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
          setroles(response.data.data);
          setNumberOfPages(response.data.total);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    },
    [page, sort, isLoading, search]
  );

  const handlePermissionsChange = (event, id) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      const permission = allPermissions.find((perm) => perm.id === id);
      if (permission) {
        setRoleSync((prevRoleSync) => ({
          ...prevRoleSync,
          permissions: [...prevRoleSync.permissions, permission],
        }));
      }
    } else {
      setRoleSync((prevRoleSync) => ({
        ...prevRoleSync,
        permissions: prevRoleSync.permissions.filter((perm) => perm.id !== id),
      }));
    }
  };

  const handleSyncRole = () => {
    console.log("roleSync.permissions :>> ", roleSync.permissions);
    var payload = roleSync.permissions.map((p) => p.id);
    axios
      .put(`admin/roles/${roleSync.id}/sync`, payload)
      .then(() => {
        toggleSyncModal();
        Toast.notifyMessage(`role's permissions synced syccessfully`);
      })
      .catch((err) => {
        console.log("err :>> ", err);
      })
      .finally(() => {
        setRoleSync({
          id: 0,
          permissions: [],
        });
      });
  };

  useEffect(() => {
    if (!Permission.can(auth, "read-roles")) {
      return navigate("/admin/dashboard", {
        replace: true,
      });
    } else {
      let params = new URLSearchParams(location.search);
      params.get("page") ? fetchRoles(page) : fetchRoles();
      axios
        .get("admin/permissions")
        .then((result) => {
          console.log("result.data :>> ", result.data);
          setAllPermissons(result.data);
        })
        .catch((err) => {
          console.log("err :>> ", err);
        });
    }
  }, []);

  const columns = [{ title: "Name", dataField: "name", sortable: true }];

  const onActionExecuted = (id) => {
    axios.get(`admin/roles/${id}/permissions`).then((response) => {
      setRoleSync({
        id: id,
        permissions: response.data,
      });
      setShowSyncModal(true);
    });
  };

  const additionalActions = [{ icon: "fa-eye", onAction: onActionExecuted }];

  return (
    <>
      <div className="container w-screen sm:!w-11/12 mx-auto">
        <div className="flex justify-between">
          <button
            className="inline-block ml-3 rounded mt-3 bg-indigo-600 px-6 pb-2 pt-2.5 text-base font-medium leading-normal text-white"
            onClick={toggleModal}
          >
            Add role
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
          className="bg-gray-50 border border-gray-300 my-3 text-gray-900 text-sm rounded-lg focus:ring-blue-500
                     focus:border-blue-500 block w-1/4 ml-3 p-2.5 dark:bg-gray-700 dark:border-gray-600
                      dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
                       dark:focus:border-blue-500"
          placeholder="search..."
          required
        />

        <Table
          columns={columns}
          data={roles}
          selected={selected}
          canEdit="update-roles"
          canDelete="delete-roles"
          handleEdit={openEditForm}
          handleDelete={handleDelete}
          handleCheckboxChange={handleCheckboxChange}
          handleSelectAll={handleSelectAll}
          isSelected={isSelected}
          isLoading={isLoading}
          handleSort={handleSort}
          additionalActions={additionalActions}
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
        header="add role"
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
      </Modal>

      <Modal
        header="edit role"
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

      <Modal
        header="sync role's permissions"
        identifier="sync"
        showModal={showSyncModal}
        toggleModal={toggleSyncModal}
        onSubmit={handleSyncRole}
        errors={errors.edit}
      >
        <div className="flex flex-wrap gap-2">
          {Array.from(allPermissions).map((item) => (
            <>
              <label htmlFor="perm">{item.name}</label>
              <input
                type="checkbox"
                id={`perm-${item.id}`}
                value={item.id}
                checked={roleSync.permissions.some(
                  (perm) => perm.id === item.id
                )}
                onChange={(event) => handlePermissionsChange(event, item.id)}
              />
            </>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default Roles;
