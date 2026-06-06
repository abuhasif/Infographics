import html2canvas from 'html2canvas';

// Works on http/https AND file://
async function toDataURL(absUrl: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    // safe even if not needed; ignored on file://
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('2D context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${absUrl}`));
    };

    img.src = absUrl;
  });
}

function abs(url: string) {
  return new URL(url, window.location.href).toString();
}

/**
 * Pre-fetch all <svg><image> hrefs under `root` and return a function that
 * rewrites them to data: URLs in the DOM clone html2canvas renders.
 */
async function prepareInlineSvgImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll('svg image'));
  const urls = Array.from(
    new Set(
      imgs
        .map(
          (img) =>
            img.getAttribute('href') ||
            img.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
        )
        .filter(Boolean) as string[]
    )
  );

  const map = new Map<string, string>();

  for (const u of urls) {
    const a = abs(u);
    try {
      const data = await toDataURL(a);
      map.set(u, data);
      map.set(a, data);
    } catch (err) {
      console.warn('Failed to inline SVG icon', u, err);
      // keep going; that icon will just render as-is
    }
  }

  return (doc: Document) => {
    const clonedImages = doc.querySelectorAll('svg image');
    clonedImages.forEach((img) => {
      const href =
        img.getAttribute('href') ||
        img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');

      const data = href && (map.get(href) || map.get(abs(href)));
      if (data) {
        img.setAttribute('href', data);
        img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', data);
      }

      const svg = img.closest('svg');
      if (svg) {
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      }
    });
  };
}

export async function exportInfographic(
  selector: string,
  filename = 'infographic.png'
) {
  const node = document.querySelector(selector) as HTMLElement;
  if (!node) {
    alert('Infographic container not found.');
    return;
  }

  await Promise.all([
    ...Array.from(document.images).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((r) => {
            img.onload = img.onerror = r;
          })
    ),
    (document as any).fonts?.ready?.catch(() => {}),
  ]);

  const rewriteSvgImages = await prepareInlineSvgImages(node);

  const canvas = await html2canvas(node, {
    useCORS: true,
    backgroundColor: '#ffffff',
    scale: 2,
    scrollY: -window.scrollY,
    onclone: (clonedDoc) => {
      rewriteSvgImages(clonedDoc);

      clonedDoc.querySelectorAll('svg').forEach((svg) => {
        if (!svg.getAttribute('xmlns')) {
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        }
        if (!svg.getAttribute('xmlns:xlink')) {
          svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        }
      });
    },
  });

  const link = document.createElement('a');
  link.href = canvas.toDataURL();
  link.download = filename;
  link.click();
}
