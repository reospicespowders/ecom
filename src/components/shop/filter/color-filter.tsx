'use client';
import React, { useEffect, useState } from 'react';
import { getProducts } from '@/lib/sanity.fetch';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { add_colors } from '@/redux/features/filter';

const ColorFilter = () => {
  const [uniqueColors, setUniqueColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors: stateColors } = useAppSelector((state) => state.filter);
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function fetchColors() {
      setLoading(true);
      try {
        const products = await getProducts();
        const allColors: string[] = products.flatMap((item: any) => item.color || []); // Ensure color is an array or default to empty
        const unique = [...new Set(allColors)].slice(0, 5);
        setUniqueColors(unique);
      } catch (error) {
        console.error("Failed to fetch colors:", error);
        setUniqueColors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchColors();
  }, []);

  return (
    <div className="tpshop__widget mb-30 pb-25">
    <h4 className="tpshop__widget-title mb-20">Filter by Color</h4>
    <div className="tpshop__widget-color-box">
      {loading ? (
        <p>Loading colors...</p>
      ) : uniqueColors.length > 0 ? (
        uniqueColors.map((color) => (
          <div className="form-check" key={color}>
            <input
              className="form-check-input black-input"
              style={{ backgroundColor: color }}
              type="checkbox"
              id={`color-${color}`}
              onChange={() => dispatch(add_colors(color!))}
              checked={stateColors.includes(color!)}
            />
            <label
              className="form-check-label"
              htmlFor={`color-${color}`}
            >
              {color}
            </label>
          </div>
        ))
      ) : (
        <p>No colors found.</p>
      )}
    </div>
</div>
  );
};

export default ColorFilter;