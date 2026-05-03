// styled-jsx ships its own type augmentation for `<style jsx>` and
// `<style jsx global>`, but Next.js's project tsconfig doesn't load it
// automatically. This reference pulls in the augmentation so every
// component using <style jsx>... typechecks without per-site overrides.

/// <reference types="styled-jsx" />

export {};
