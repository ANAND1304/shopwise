export default function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect('')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
          !selected
            ? 'bg-brand-600 text-white border-brand-600'
            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border capitalize transition ${
            selected === cat
              ? 'bg-brand-600 text-white border-brand-600'
              : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
