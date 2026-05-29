# Photos Directory

Drop photo files into this directory and they appear on the photos page automatically.

## Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)

> Animated GIFs are not recommended: Hugo's image processing flattens them to a
> single frame, so the animation is lost.

## How It Works
The photos page discovers every image in this directory, generates resized WebP
thumbnails (and a larger WebP for the lightbox), and lays them out as a masonry
grid. The originals are never published — only the re-encoded variants, which
also strips EXIF metadata (including any GPS coordinates).

## Recommended Image Specifications
- Format: JPEG for photos (converted to WebP on build)
- Size: any size works; Hugo creates the optimized variants
- For best results: 1500px–3000px on the long edge

## Adding alt text and captions
Alt text and captions are optional but recommended for accessibility. Set them
per image via a `resources` block in `index.md`, matched by filename:

```toml
[[resources]]
  src = "DSCF4899.jpg"
  [resources.params]
    alt = "Sunrise over the harbour"
    caption = "Sydney Harbour, November 2024"
```

If no `alt` is given the image is treated as decorative (`alt=""`) rather than
labelled with a meaningless placeholder.

## Tips
- Images display in alphabetical order by filename
- Name files with numbers or dates to control ordering (e.g. `001-photo.jpg`, `2024-11-16-sunset.jpg`)
