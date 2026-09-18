/**
 * WebGL Safety Polyfill / Patch
 *
 * Prevents Three.js r163+ WebGLState crash:
 * "THREE.WebGLRenderer: Cannot read properties of null (reading 'indexOf')"
 *
 * In Three.js WebGLState.js (lines 388-390):
 *   const glVersion = gl.getParameter( gl.VERSION );
 *   if ( glVersion.indexOf( 'WebGL' ) !== - 1 ) { ... }
 *
 * When WebGL context is lost, uninitialized, or running in an environment where
 * getParameter(gl.VERSION) returns null/undefined, Three.js crashes with a fatal TypeError.
 * This patch guarantees getParameter returns safe fallback values for critical parameters.
 */

if (typeof window !== 'undefined') {
  const patchContextProto = (proto: any) => {
    if (!proto || !proto.getParameter || (proto as any).__threejs_safe_patched) return;
    try {
      const originalGetParameter = proto.getParameter;
      proto.getParameter = function (pname: number) {
        try {
          const val = originalGetParameter.call(this, pname);
          if (pname === this.VERSION) {
            if (typeof val !== 'string' || !val) {
              return 'WebGL 2.0 (ThreeJS-Safe)';
            }
          }
          if (pname === this.SCISSOR_BOX) {
            if (!val || (!Array.isArray(val) && !(val instanceof Int32Array) && !(val instanceof Float32Array))) {
              return new Int32Array([0, 0, 800, 600]);
            }
          }
          if (pname === this.VIEWPORT) {
            if (!val || (!Array.isArray(val) && !(val instanceof Int32Array) && !(val instanceof Float32Array))) {
              return new Int32Array([0, 0, 800, 600]);
            }
          }
          if (pname === this.MAX_COMBINED_TEXTURE_IMAGE_UNITS) {
            if (val === null || val === undefined || val === 0) {
              return 16;
            }
          }
          return val;
        } catch {
          if (pname === this.VERSION) return 'WebGL 2.0 (ThreeJS-Safe)';
          if (pname === this.SCISSOR_BOX || pname === this.VIEWPORT) return new Int32Array([0, 0, 800, 600]);
          if (pname === this.MAX_COMBINED_TEXTURE_IMAGE_UNITS) return 16;
          return null;
        }
      };
      (proto as any).__threejs_safe_patched = true;
    } catch {
      // Ignore if prototype is frozen
    }
  };

  if (typeof WebGLRenderingContext !== 'undefined') {
    patchContextProto(WebGLRenderingContext.prototype);
  }
  if (typeof WebGL2RenderingContext !== 'undefined') {
    patchContextProto(WebGL2RenderingContext.prototype);
  }
}

export {};
