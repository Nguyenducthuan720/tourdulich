import { useEffect, useState } from 'react'
import { getCategories } from '../../api/categoryService'

export default function CategoryFilter({ onCategorySelect, selectedCategory }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Fetch categories error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      onCategorySelect(null)
    } else {
      onCategorySelect(categoryId)
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">
      <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-amber-600">Danh mục</h3>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`w-full rounded-xl px-5 py-3 text-sm font-bold transition text-left ${
              selectedCategory === null
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Tất cả danh mục
          </button>
          {categories.map((category) => (
            <button
              key={category.CategoryID}
              onClick={() => handleCategoryClick(category.CategoryID)}
              className={`w-full rounded-xl px-5 py-3 text-sm font-bold transition text-left ${
                selectedCategory === category.CategoryID
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {category.CategoryName}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
