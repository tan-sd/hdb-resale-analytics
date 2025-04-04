import { ref, onBeforeUnmount } from "vue";

export function useIntersectionObserver({ threshold = 0.25 } = {}) {
    const isVisible = ref(false);
    let observer = null;

    const observe = (el) => {
        if (!el) return;

        observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    isVisible.value = true;
                    observer.unobserve(el);
                }
            },
            { threshold }
        );

        observer.observe(el);
    };

    onBeforeUnmount(() => {
        if (observer) observer.disconnect();
    });

    return { isVisible, observe };
}