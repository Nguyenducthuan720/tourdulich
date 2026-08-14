import { useEffect, useState } from 'react'
import { getCategories } from '../../api/categoryService'
import { Icon } from '../icons'

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
    onCategorySelect(selectedCategory === categoryId ? null : categoryId)
  }

  return (
    <div className="card p-6">
      <h3 className="eyebrow mb-5">Danh mục</h3>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-12 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5 lg:flex-col lg:flex-nowrap">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
              selectedCategory === null
                ? 'bg-brand-500 text-white shadow-soft'
                : 'bg-ink-50 text-ink-700 hover:bg-ink-100'
            }`}
          >
            <Icon name="spark" className="h-4 w-4" />
            Tất cả tour
          </button>
          {categories.map((category) => {
            const active = selectedCategory === category.CategoryID
            return (
              <button
                key={category.CategoryID}
                onClick={() => handleCategoryClick(category.CategoryID)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                  active
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'bg-ink-50 text-ink-700 hover:bg-ink-100'
                }`}
              >
                {category.CategoryName}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
