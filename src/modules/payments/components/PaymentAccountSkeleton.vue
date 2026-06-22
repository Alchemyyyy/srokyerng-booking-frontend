<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i"
            class="bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden border-t-4 animate-pulse">

            <div class="p-5 flex justify-between items-center border-b border-(--color-border) bg-(--color-input)/10">
                <div class="h-6 w-24 rounded bg-(--color-surface-soft) animate-pulse"></div>
                <div class="flex items-center gap-2">
                    <div class="h-6 w-16 rounded bg-(--color-surface-soft) animate-pulse"></div>
                    <div class="h-7 w-7 rounded bg-(--color-surface-soft) animate-pulse "></div>
                    <div class="h-7 w-7 rounded bg-(--color-surface-soft) animate-pulse "></div>
                </div>
            </div>

            <div class="p-5 space-y-5 flex-1">
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <div class="h-3 w-16 rounded bg-(--color-surface-soft) animate-pulse"></div>
                        <div class="h-4 w-28 rounded bg-(--color-surface-soft) animate-pulse"></div>
                    </div>
                    <div class="space-y-2 flex flex-col items-end">
                        <div class="h-3 w-16 rounded bg-(--color-surface-soft) animate-pulse"></div>
                        <div class="h-4 w-24 rounded bg-(--color-surface-soft) animate-pulse"></div>
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="h-3 w-24 rounded bg-(--color-surface-soft) animate-pulse"></div>
                    <div class="h-5 w-44 rounded bg-(--color-surface-soft) animate-pulse"></div>
                </div>

                <div class="border-t border-(--color-border) pt-4 flex items-center justify-between gap-4">
                    <div class="space-y-2">
                        <div class="h-4 w-28 rounded bg-(--color-surface-soft) animate-pulse"></div>
                        <div class="h-3 w-36 rounded bg-(--color-surface-soft) animate-pulse"></div>
                    </div>
                    <div class="w-16 h-16 rounded bg-(--color-surface-soft) animate-pulse"></div>
                </div>

                <div class="border-t border-(--color-border)/60 pt-3 space-y-2">
                    <div class="flex justify-between">
                        <div class="h-3 w-12 rounded bg-(--color-surface-soft) animate-pulse"></div>
                        <div class="h-3 w-24 rounded bg-(--color-surface-soft) animate-pulse"></div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>