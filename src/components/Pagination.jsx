import ReactPaginate from "react-paginate";
// eslint-disable-next-line react/prop-types
export default function Pagination({ page, numberofPages, changePage }) {
  return (
    <ReactPaginate
      pageCount={numberofPages}
      forcePage={page - 1}
      pageRangeDisplayed={2}
      marginPagesDisplayed={3}
      onPageChange={changePage}
      containerClassName="flex items-center -space-x-px h-8 text-sm mb-3"
      activeClassName="!bg-indigo-600 text-white px-3 h-8 border border-indigo-600"
      pageClassName="bg-white text-gray-500 flex items-center px-3 h-8 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      previousLinkClassName={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white${
        page <= 1 ? " !cursor-not-allowed" : ""
      }`}
      nextLinkClassName={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white${
        page >= numberofPages ? " !cursor-not-allowed" : ""
      }`}
      breakClassName="bg-white text-gray-500 px-3 h-8 border border-gray-300"
      previousLabel={'prev'}
      nextLabel={'next'}
      disableInitialCallback={true}
    />
  );
}
