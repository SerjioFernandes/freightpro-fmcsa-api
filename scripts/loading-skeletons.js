/**
 * Loading Skeleton Utilities for CargoLume
 * Provides better UX by showing placeholder content while data loads
 */

'use strict';

const SkeletonLoader = {
    /**
     * Create a skeleton load card
     * @returns {HTMLElement} Skeleton element
     */
    createLoadCardSkeleton() {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-load-card';
        skeleton.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="skeleton skeleton-line skeleton-line-medium mb-2"></div>
                    <div class="skeleton skeleton-line skeleton-line-short"></div>
                </div>
                <div class="skeleton skeleton-circle"></div>
            </div>
            <div class="skeleton skeleton-line skeleton-line-long mb-2"></div>
            <div class="skeleton skeleton-line skeleton-line-medium mb-2"></div>
            <div class="skeleton skeleton-line skeleton-line-short mb-4"></div>
            <div class="flex gap-2">
                <div class="skeleton skeleton-button"></div>
                <div class="skeleton skeleton-button"></div>
            </div>
        `;
        return skeleton;
    },

    /**
     * Create a skeleton dashboard card
     * @returns {HTMLElement} Skeleton element
     */
    createDashboardCardSkeleton() {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        skeleton.innerHTML = `
            <div class="skeleton skeleton-avatar"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-subtitle mb-3"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
        `;
        return skeleton;
    },

    /**
     * Show skeleton loaders in a container
     * @param {HTMLElement|string} container - Container element or selector
     * @param {number} count - Number of skeletons to show
     * @param {string} type - Type of skeleton ('loadCard', 'dashboardCard')
     */
    show(container, count = 3, type = 'loadCard') {
        const containerEl = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        if (!containerEl) return;

        // Clear existing content
        containerEl.innerHTML = '';

        // Add skeleton wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'skeleton-container';
        wrapper.id = 'skeleton-loader';

        // Create skeletons
        for (let i = 0; i < count; i++) {
            const skeleton = type === 'dashboardCard' 
                ? this.createDashboardCardSkeleton()
                : this.createLoadCardSkeleton();
            wrapper.appendChild(skeleton);
        }

        containerEl.appendChild(wrapper);
    },

    /**
     * Hide skeleton loaders and show actual content
     * @param {HTMLElement|string} container - Container element or selector
     * @param {HTMLElement|string} content - Content to show
     */
    hide(container, content) {
        const containerEl = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        if (!containerEl) return;

        // Remove skeleton
        const skeletonEl = containerEl.querySelector('#skeleton-loader');
        if (skeletonEl) {
            skeletonEl.remove();
        }

        // Add content with fade-in animation
        if (content) {
            const contentEl = typeof content === 'string'
                ? document.querySelector(content)
                : content;
            
            if (contentEl) {
                contentEl.classList.add('content-loaded');
                containerEl.appendChild(contentEl);
            }
        }
    },

    /**
     * Show form field skeletons
     * @param {HTMLElement|string} container - Container element or selector
     * @param {number} count - Number of fields
     */
    showFormSkeleton(container, count = 5) {
        const containerEl = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        if (!containerEl) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'skeleton-container';
        wrapper.id = 'skeleton-loader';

        for (let i = 0; i < count; i++) {
            const field = document.createElement('div');
            field.className = 'skeleton skeleton-form-field';
            wrapper.appendChild(field);
        }

        containerEl.appendChild(wrapper);
    },

    /**
     * Show table row skeletons
     * @param {HTMLElement|string} container - Container element or selector
     * @param {number} rows - Number of rows
     * @param {number} columns - Number of columns
     */
    showTableSkeleton(container, rows = 5, columns = 4) {
        const containerEl = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        if (!containerEl) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'skeleton-container';
        wrapper.id = 'skeleton-loader';

        for (let i = 0; i < rows; i++) {
            const row = document.createElement('div');
            row.className = 'skeleton-table-row';
            
            for (let j = 0; j < columns; j++) {
                const cell = document.createElement('div');
                cell.className = 'skeleton skeleton-table-cell';
                row.appendChild(cell);
            }
            
            wrapper.appendChild(row);
        }

        containerEl.appendChild(wrapper);
    }
};

// Make globally available
window.SkeletonLoader = SkeletonLoader;

/**
 * Example Usage:
 * 
 * // Show skeletons while loading
 * SkeletonLoader.show('#load-board-container', 6, 'loadCard');
 * 
 * // Fetch data
 * const loads = await fetchLoads();
 * 
 * // Hide skeletons and show content
 * SkeletonLoader.hide('#load-board-container');
 * renderLoads(loads);
 */

