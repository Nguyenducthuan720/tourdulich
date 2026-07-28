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
    <div className="rounded-xl bg-white p-6 shadow-md border border-slate-100">
      <h3 className="mb-4 text-lg font-bold text-slate-900"> Danh mục</h3>
      
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition text-left ${
              selectedCategory === null
                ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400'
                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
             Tất cả danh mục
          </button>
          {categories.map((category) => (
            <button
              key={category.CategoryID}
              onClick={() => handleCategoryClick(category.CategoryID)}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition text-left ${
                selectedCategory === category.CategoryID
                  ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
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
