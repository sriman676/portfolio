# VERIFICATION.md: REBUILD_PROMPT.md Step 0 (Cosmos v4)

Checked 2026-10-16. Status: **VERIFIED** (the source says so), **CORRECTED** (the claim was wrong or incomplete; the correct
form is given), **UNVERIFIED** (could not be confirmed; owner decision needed before use). "Derived" means the stated form
follows from a verified source in one or two lines of algebra, shown in the note; every derived item gets a unit test
before it ships. Formula rows were first checked 2026-10-14 and are carried over unchanged unless noted.

## 1. Skill repos

| item | claimed | verified result | source | status |
|---|---|---|---|---|
| emalorenzo/three-agent-skills | exists, has `three-best-practices` | Exists, 61★, last push 2026-01-28, not archived. `skills/three-best-practices/SKILL.md` and `skills/r3f-best-practices/SKILL.md`. No repo LICENSE detected; the SKILL.md front-matter says MIT | GitHub API + git tree | VERIFIED |
| its install command | `npx skills add … --skill <name>` | README: `npx add-skill three-agent-skills --skill three-best-practices`. `npx skills add https://github.com/emalorenzo/three-agent-skills --skill <name>` also worked on 2026-10-14 | repo README; `skills-lock.json` | CORRECTED |
| vanilla three.js skill set | "cloudai-x/threejs-skills" (unverified URL) | **Exists as `CloudAI-X/threejs-skills`**: 3581★, last push 2026-07-09, not archived, **no LICENSE file**. 10 skills: threejs-fundamentals, -animation, -geometry, -interaction, -lighting, -loaders, -materials, -postprocessing, -shaders, -textures. Already installed in `~/.claude/skills` and byte-identical to upstream, ignoring line endings (checked 2026-10-14) | GitHub API + git tree | VERIFIED |
| already installed | – | three-best-practices, r3f-best-practices and react-three-fiber in `.agents/skills` → `.claude/skills` (gitignored). **r3f-best-practices and react-three-fiber don't apply to a vanilla engine (LOCKED #1)** | local | note |

## 2. Rapier (design reference only)

| item | claimed | verified result | source | status |
|---|---|---|---|---|
| github.com/dimforge/rapier | exists | Exists, **Apache-2.0**, 5872★, last push 2026-10-10 | GitHub API | VERIFIED |

## 3. Dependencies

| item | claimed | verified result | source | status |
|---|---|---|---|---|
| next | current stable, App Router | **16.4.2** (npm, modified 2026-10-15). The legacy site runs 16.4.0 App Router on Vercel in production (sriman-rutvik.vercel.app), so the stack is proven on this project | `npm view next` | VERIFIED |
| three | current stable | **0.186.1** (npm, 2026-09-24), the version already installed | `npm view three` | VERIFIED |
| three: WebGLRenderer, ShaderMaterial, InstancedMesh | exist | `class WebGLRenderer` (src/renderers/WebGLRenderer.js:63), `class ShaderMaterial` (src/materials/ShaderMaterial.js:45), `class InstancedMesh` (src/objects/InstancedMesh.js:28) | installed source | VERIFIED |
| three: GLTFLoader, DRACOLoader, KTX2Loader, meshopt decoder | exist | `examples/jsm/loaders/{GLTFLoader,DRACOLoader,KTX2Loader}.js`, `examples/jsm/libs/meshopt_decoder.module.js`. GLTFLoader has `setDRACOLoader`, `setKTX2Loader` and `setMeshoptDecoder` (l.349–377) and handles `KHR_draco_mesh_compression`, `EXT_meshopt_compression`, `KHR_texture_basisu` and `EXT_texture_webp` | installed source | VERIFIED |
| WebGL2 GPU timer query | via three | **three's WebGLRenderer does not use it.** Only the WebGPU renderer's WebGL fallback does (`webgl-fallback/WebGLBackend.js:272`). We call it ourselves: `gl.getExtension('EXT_disjoint_timer_query_webgl2')`, then `gl.beginQuery(ext.TIME_ELAPSED_EXT, q)` / `gl.endQuery(ext.TIME_ELAPSED_EXT)`, poll `QUERY_RESULT_AVAILABLE`, read `QUERY_RESULT` (64-bit ns), and discard the result if `gl.getParameter(ext.GPU_DISJOINT_EXT)` is true. The extension can be missing, so the perf HUD shows "GPU n/a" | Khronos WebGL extension registry #33; three source | CORRECTED (we wire it, not three) |
| postprocessing | current stable | **6.39.5** (2026-09-09). Its peer dependency on three is `>=0.168 <0.187`, so it supports 0.186.1 | `npm view`; package.json | VERIFIED |
| postprocessing: EffectComposer, EffectPass, custom Effect | exist | `export class EffectComposer`, `export class EffectPass` (build/types). Effect constructor: `(name, fragmentShader, { attributes, blendFunction, defines: Map, uniforms: Map<string, Uniform>, extensions, vertexShader })`; hooks `update(renderer, inputBuffer, deltaTime)`, `setSize`, `initialize`. Shader entry points: `mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor)` (plus a depth variant) and `mainUv(inout vec2 uv)` | `src/effects/Effect.js` at v6.39.5; types; wiki "Custom Effects" | VERIFIED |
| postprocessing merge rules | "merge into few passes" | Effects merge into one `EffectPass`, except: **at most one `EffectAttribute.CONVOLUTION` effect per pass**, and **convolution effects can't share a pass with effects that implement `mainUv`**. The wiki doesn't actually recommend minimising passes; that's our own perf rule | types (`EffectAttribute` docs, l.4319); wiki "Custom Effects" | VERIFIED |
| zustand/vanilla | `createStore` | 5.0.15 (2026-08-13). `export declare const createStore: CreateStore` in `zustand/vanilla.d.ts`; no React import needed | installed types | VERIFIED |

## 4. Vercel

| item | claimed | verified result | source | status |
|---|---|---|---|---|
| Next.js deployment | works | Zero-config; already in production for this project (see the `next` row) | live deploy | VERIFIED |
| Function limits | – | Fluid compute: **max duration 300 s on Hobby** (Pro 800 s); **request/response body 4.5 MB** (413 above that); memory 2 GB on Hobby; bundle 250 MB uncompressed; 1,024 file descriptors; "Full Node.js coverage". Page last updated 2026-08-24 | vercel.com/docs/functions/limitations | VERIFIED |
| Admin backend storage | "KV" | **Vercel KV is no longer listed.** Current options: Blob (files), Global Config (read-heavy, writes take seconds), and **Marketplace storage** (Upstash Redis, Neon Postgres, Supabase) with credentials injected as env vars, e.g. `vercel install upstash`. Using a vendor SDK such as `@upstash/redis` would be a new runtime dependency (LOCKED #2), but Upstash also has a REST API that plain `fetch` can call. Page last updated 2026-09-03 | vercel.com/docs/storage | CORRECTED |

## 5. Auth libraries (never hand-rolled)

| item | proposal | verified result | source | status |
|---|---|---|---|---|
| Password hashing | **@node-rs/argon2 2.2.2** (argon2id) | Active (napi-rs/node-rs MIT, pushed 2026-10-15). No runtime deps; prebuilt binaries for linux-x64-gnu/musl, win32, darwin and more. **0 GitHub advisories** | npm; GitHub API; GitHub Advisory DB | VERIFIED |
| Password hashing (alt) | argon2 0.45.1 | Active (ranisalt/node-argon2 MIT, pushed 2026-09-07). Needs `node-gyp-build` + `node-addon-api`. 0 advisories | same | VERIFIED |
| Runs on Vercel functions | – | The docs say "Full Node.js coverage" but **don't mention native `.node` addons**. Not proven until a preview deploy runs a hash | – | **UNVERIFIED** (test in the security phase; fallback: owner picks a pure-WASM option) |
| TOTP | **otpauth 9.5.2** | Active (hectorm/otpauth MIT, pushed 2026-10-12). One dependency (`@noble/hashes`). **1 advisory: GHSA-rmmc-8cqj-hfp3 (high), "Authentication Bypass", affects < 3.2.8 only**, so it's fixed in 9.x | same | VERIFIED |
| TOTP (alt) | otplib 13.5.0 | Active (yeojz/otplib MIT, pushed 2026-10-11). 6 internal @otplib packages + noble. 0 advisories | same | VERIFIED |

## 6. Blender

| item | claimed | verified result | source | status |
|---|---|---|---|---|
| Official connector | lab.blender.org/mcp, April 2026 | **lab.blender.org/mcp is 404.** The real page is **blender.org/lab/mcp-server/**: "MCP Server", status "Released", add-on **v1.0.3**, **Blender 5.1 or newer**, repo projects.blender.org/lab/blender_mcp (returns 403 to automated fetch, so license and tool list are **unconfirmed**). **No Claude Code or Claude Desktop install steps** (it documents Llama.cpp and `.mcpb` bundles). Security note on the page: it "will execute LLM generated code in Blender **without any guards in place**", and it recommends a VM. The April 2026 date only appears on third-party sites | blender.org/lab, blender.org/lab/mcp-server | CORRECTED (URL, version); install steps for Claude Code UNVERIFIED |
| Community connector | github.com/ahujasid/blender-mcp | Now **ahujasid/mcp-for-blender** (PyPI `mcp-for-blender`; old name still works). MIT, 30995★, **last commit 2026-10-06**. Documents Claude Code; has an opt-in **safe mode** (`BLENDER_MCP_SAFE_MODE=1`: AST allowlist, only bpy/bmesh/mathutils); telemetry off by default; local socket 127.0.0.1:9876 | GitHub API; source read on 2026-10-16 | VERIFIED |
| **Recommendation** | pick one | **mcp-for-blender.** It documents Claude Code, has a code sandbox (the official server says it has none), its source is fully readable and pinned (v2.1.9 / commit 7a0373e), and it's already installed and working here with safe mode on. Revisit the official server once its repo, license and tool list are readable | – | recommendation |
| Installed Blender | – | **Blender 5.2.2 LTS**, portable at `D:\Downloads\blender` | `bpy.app.version_string` | VERIFIED |
| Headless mode | `blender --background --python <script>` | Works; scripts ran headless on 2026-10-16 (add-on install, introspection, test exports) | local run | VERIFIED |
| GLB export | bpy API | `bpy.ops.export_scene.gltf(filepath=…, export_format='GLB', export_yup=True, export_apply=…, use_selection=…)`: a real export returned `{'FINISHED'}` | headless introspection + test export | VERIFIED |
| Draco | bpy API | `export_draco_mesh_compression_enable`, `_level`, and `_position/_normal/_texcoord/_color/_generic_quantization`. The test GLB contains `KHR_draco_mesh_compression` | same | VERIFIED |
| meshopt | bpy API | **Built into the 5.2 exporter**: `export_meshopt_compression_enable`, `export_meshopt_extension`. The test GLB contains `EXT_meshopt_compression`, which three's GLTFLoader reads via `setMeshoptDecoder` | same | VERIFIED |
| KTX2 textures | from Blender | **Not available in Blender's exporter.** `export_image_format` ∈ {AUTO, JPEG, WEBP, NONE}, plus `export_image_add_webp` / `export_image_webp_fallback`. KTX2 needs an extra tool (e.g. KTX-Software `toktx` or glTF-Transform): a new dev tool that needs owner approval. **WebP** works today (three reads `EXT_texture_webp`) | headless introspection | CORRECTED |
| Lightmap baking | bpy API | `bpy.ops.object.bake(type=…, margin=…, margin_type=…, target=…)`, types {COMBINED, AO, SHADOW, POSITION, NORMAL, UV, ROUGHNESS, EMIT, ENVIRONMENT, DIFFUSE, GLOSSY, TRANSMISSION}. Baking needs the Cycles engine; the full bake script gets its own test in the pipeline phase | headless introspection | VERIFIED (operator); full script untested |

## 7. Formulas (carried over from 2026-10-14, with the 2026-10-16 owner decisions)

| item | claimed | verified result | source | status |
|---|---|---|---|---|
| 7a Light-bending raymarch | d²x/dλ² = −(3/2)·h²·x/\|x\|⁵, h = \|x×v\|, r_s = 1 | **Correct as written.** Light obeys u″ + u = (3/2) r_s u². Binet for a central force per unit mass of magnitude f gives u″ + u = f/(h²u²). f = (3/2)h²/r⁴, which is \|x\|·(3/2)h²/r⁵, gives (3/2)u², i.e. r_s = 1. Checked numerically: the legacy test matches 2r_s/b within 0.95–1.08 | Wikipedia "Schwarzschild geodesics" §Bending of light (derived) + `tests/unit/blackhole.test.ts` | VERIFIED (derived + tested) |
| 7b(i) Beaming, accretion disk | D³ / D⁴ / D^(3+α) | **D⁴ on frequency-integrated brightness, colour = blackbody at gT (linearised).** I_ν/ν³ is invariant ⇒ I_ν = δ³I′ (B3); integrating over frequency adds one δ (B5) ⇒ δ⁴ (equivalently (gT)⁴ by Stefan–Boltzmann). Already fixed in legacy code on 2026-10-16 | Urry & Padovani 1995 App. B (NED mirror) | CORRECTED |
| 7b(ii) Beaming, starfield | – | No verified source for a point star seen by a moving observer. **Owner decision 2026-10-16: δ⁴ on sprite brightness, labelled CINEMATIC** | – | UNVERIFIED → accepted as CINEMATIC |
| Doppler factor | D = 1/(γ(1−β cosθ)) | Correct with θ = angle between the source velocity and the line of sight toward the observer (approaching ⇒ θ = 0 ⇒ blueshift). Wikipedia's receiver-frame form f_r = f_s/(γ(1+β cosθ_r)) uses the opposite convention; MATH.md pins ours with a test | Wikipedia "Relativistic beaming", "Relativistic Doppler effect" Eq. 6–7 | CORRECTED (convention) |
| Aberration | cosθ′ = (cosθ − β)/(1 − β cosθ) | Matches the source-moving form exactly. For the moving ship use tan(φ/2) = √((1−β)/(1+β))·tan(θ/2); a test asserts both forms agree | Wikipedia "Relativistic aberration"; "Aberration (astronomy)" | VERIFIED (convention noted) |
| Weak-field deflection | α ≈ 2r_s/b | δφ ≈ 2r_s/b = 4GM/(c²b) | Wikipedia "Schwarzschild geodesics" | VERIFIED |
| Vis-viva | v² = GM(2/r − 1/a) | Exact; ε = −GM/(2a); bound ⇔ a > 0 ⇔ ε < 0 (derived) | Wikipedia "Vis-viva equation" | VERIFIED |
| Photon sphere | 1.5 r_s | 3/2 r_s = 3GM/c² | Wikipedia "Photon sphere" | VERIFIED |
| ISCO | 3 r_s | 6GM/c² = 3R_S (non-rotating) | Wikipedia "Innermost stable circular orbit" | VERIFIED |
| Gravitational redshift | √(1 − r_s/r) | 1 + z = 1/√(1 − r_S/R_e) for a static emitter ⇒ ν_obs = ν_em√(1 − r_s/r); clock rate dτ/dt = √(1 − r_s/R) for a static observer. Orbiting gas also needs the Doppler term | Wikipedia "Gravitational redshift" | VERIFIED |
| Disk temperature | T ∝ r^(−3/4) | Full form T_eff⁴ = (3GMṀ/8πσr³)[1 − √(r_in/r)]; r^(−3/4) is only the large-r limit | Armitage, arXiv:2201.07262 eq. 123 | CORRECTED |
| Beer–Lambert | T = e^(−σd) | T = exp(−∫μ dz) = e^(−τ); uniform: τ = σnℓ. Use μ = σn | Wikipedia "Beer–Lambert law" | CORRECTED |
| Exponential fog | f = e^(−density·d) | Beer–Lambert with uniform μ = density. three's `FogExp2` squares the exponent, so we write our own | Wikipedia "Beer–Lambert law" | VERIFIED |
| Inverse-square | I ∝ 1/r² | Point source | Wikipedia "Inverse-square law" | VERIFIED |
| Rayleigh | ∝ λ⁻⁴ | I_s = I₀·8π⁴α²/(λ⁴R²)·(1 + cos²θ) | Wikipedia "Rayleigh scattering" | VERIFIED |
| Logarithmic spiral | r = a·e^(bθ) | r = a e^(kφ), a > 0, k ≠ 0; galaxy arms only approximately logarithmic | Wikipedia "Logarithmic spiral" | VERIFIED |
| Impulse | j = −(1+e)(v_rel·n)/(1/m1 + 1/m2) | The no-rotation case. The full form adds (I₁⁻¹(r₁×n̂)×r₁ + I₂⁻¹(r₂×n̂)×r₂)·n̂ to the denominator; v_r = v_p2 − v_p1, n̂ from body 1 to body 2. Exact for spheres with central contact / no spin | Wikipedia "Collision response" eq. 5; "Impulse (physics)" | CORRECTED (valid subset) |
| Softened gravity | a = GM·r/(\|r\|² + ε²)^(3/2) | Plummer softening; Newtonian when ε = 0 | arXiv:1205.2729; arXiv:2112.05165 | VERIFIED |
| Semi-implicit Euler | – | v_{n+1} = v_n + a(x_n)Δt; x_{n+1} = x_n + v_{n+1}Δt; symplectic | Wikipedia "Semi-implicit Euler method" | VERIFIED |
| Fixed timestep | accumulator + interpolation | `while (acc >= dt)…`, α = acc/dt, state = cur·α + prev·(1−α) | Fiedler, "Fix Your Timestep!" | VERIFIED |
| Spatial hash | – | (x·73856093 xor y·19349663 xor z·83492791) mod n | Teschner et al., VMV 2003 (PDF text) | VERIFIED |
| ACES filmic | ACES | Narkowicz fit (x(2.51x+0.03))/(x(2.43x+0.59)+0.14); three's `ACESFilmicToneMapping` internals not checked | knarkowicz.wordpress.com 2016-01-06 | VERIFIED (fit) |
| Fresnel rim | – | Schlick R(θ) = R₀ + (1−R₀)(1−cosθ)⁵ | Wikipedia "Schlick's approximation" (Schlick 1994) | VERIFIED |
| Screen shake | trauma², decaying | Bevy's official example: `powf(trauma, 2.0)`, linear decay, credited to Eiserloh's GDC 2016 talk (talk itself not checked) | bevy.org camera/2d-screen-shake | VERIFIED (secondary) |
| Camera spring | critically damped | **Owner decision 2026-10-16 (hybrid):** derived ζ = 1 oscillator x″ = −ω²(x − target) − 2ωx′, labelled *derived*; Unreal `CriticalSpringDamper` / Unity `SmoothDamp` cited for the concept | Unreal / Unity API docs | derived (accepted) |
| sRGB → linear | – | C′ ≤ 0.04045 ? C′/12.92 : ((C′+0.055)/1.055)^2.4 | Wikipedia "sRGB" (IEC 61966-2-1) | VERIFIED |
| 7d Blackbody → RGB | approximation | Tanner Helland's fit, 1000–40000 K, t = K/100 (constants as in legacy `blackbodyRGB`). **Output is sRGB**: linearise before light math | tannerhelland.com 2012-09-18 | VERIFIED |

## Open points for the owner (before Step 1)

1. **Official vs. community Blender MCP:** I recommend **mcp-for-blender** (section 6). Approve, or tell me to switch.
2. **KTX2:** Blender can't export it. Use **WebP now** (no new tool) and add KTX2 later through an approved tool (toktx or
   glTF-Transform), or approve that tool now.
3. **Admin storage on Vercel:** Vercel KV is gone. Proposal: **Upstash Redis from the Marketplace, called via its REST API
   with `fetch`** (no new runtime dependency). Alternatively, approve `@upstash/redis`.
4. **Argon2 on Vercel** stays UNVERIFIED until a preview deploy runs a hash in the security phase. Proposed libraries:
   **@node-rs/argon2 + otpauth**.
5. **R3F skills:** `r3f-best-practices` and `react-three-fiber` don't apply to the vanilla engine. Keep them installed
   (unused) or remove them?
6. **Step 1 git state:** the legacy branch `phase/4.5-intro` has uncommitted work (scroll intro, audit fixes, the beaming
   and sRGB fixes, VERIFICATION.md). Should I commit it to `phase/4.5-intro` before tagging `v3-legacy`, or tag `main`'s
   last commit (Phase 3, `3d6d7e0`) and leave this work as it is?
