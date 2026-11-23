var L = globalThis, J = L.ShadowRoot && (L.ShadyCSS === void 0 || L.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Q = /* @__PURE__ */ Symbol(), ae = /* @__PURE__ */ new WeakMap(), Ne = class {
  constructor(e, t, s) {
    if (this._$cssResult$ = !0, s !== Q) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (J && e === void 0) {
      const s = t !== void 0 && t.length === 1;
      s && (e = ae.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && ae.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
}, qe = (e) => new Ne(typeof e == "string" ? e : e + "", void 0, Q), Xe = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((r, i, n) => r + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + e[n + 1], e[0]);
  return new Ne(s, e, Q);
}, Je = (e, t) => {
  if (J) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const r = document.createElement("style"), i = L.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = s.cssText, e.appendChild(r);
  }
}, oe = J ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const r of t.cssRules) s += r.cssText;
  return qe(s);
})(e) : e, { is: Qe, defineProperty: et, getOwnPropertyDescriptor: tt, getOwnPropertyNames: st, getOwnPropertySymbols: rt, getPrototypeOf: it } = Object, j = globalThis, le = j.trustedTypes, nt = le ? le.emptyScript : "", at = j.reactiveElementPolyfillSupport, P = (e, t) => e, K = {
  toAttribute(e, t) {
    switch (t) {
      case Boolean:
        e = e ? nt : null;
        break;
      case Object:
      case Array:
        e = e == null ? e : JSON.stringify(e);
    }
    return e;
  },
  fromAttribute(e, t) {
    let s = e;
    switch (t) {
      case Boolean:
        s = e !== null;
        break;
      case Number:
        s = e === null ? null : Number(e);
        break;
      case Object:
      case Array:
        try {
          s = JSON.parse(e);
        } catch {
          s = null;
        }
    }
    return s;
  }
}, De = (e, t) => !Qe(e, t), ce = {
  attribute: !0,
  type: String,
  converter: K,
  reflect: !1,
  useDefault: !1,
  hasChanged: De
};
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), j.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var T = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = ce) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const s = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(e, s, t);
      r !== void 0 && et(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, s) {
    const { get: r, set: i } = tt(this.prototype, e) ?? {
      get() {
        return this[t];
      },
      set(n) {
        this[t] = n;
      }
    };
    return {
      get: r,
      set(n) {
        const o = r?.call(this);
        i?.call(this, n), this.requestUpdate(e, o, s);
      },
      configurable: !0,
      enumerable: !0
    };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ce;
  }
  static _$Ei() {
    if (this.hasOwnProperty(P("elementProperties"))) return;
    const e = it(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(P("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(P("properties"))) {
      const t = this.properties, s = [...st(t), ...rt(t)];
      for (const r of s) this.createProperty(r, t[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [s, r] of t) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, s] of this.elementProperties) {
      const r = this._$Eu(t, s);
      r !== void 0 && this._$Eh.set(r, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const r of s) t.unshift(oe(r));
    } else e !== void 0 && t.push(oe(e));
    return t;
  }
  static _$Eu(e, t) {
    const s = t.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const s of t.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Je(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, s) {
    this._$AK(e, s);
  }
  _$ET(e, t) {
    const s = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, s);
    if (r !== void 0 && s.reflect === !0) {
      const i = (s.converter?.toAttribute !== void 0 ? s.converter : K).toAttribute(t, s.type);
      this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const s = this.constructor, r = s._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const i = s.getPropertyOptions(r), n = typeof i.converter == "function" ? { fromAttribute: i.converter } : i.converter?.fromAttribute !== void 0 ? i.converter : K;
      this._$Em = r;
      const o = n.fromAttribute(t, i.type);
      this[r] = o ?? this._$Ej?.get(r) ?? o, this._$Em = null;
    }
  }
  requestUpdate(e, t, s, r = !1, i) {
    if (e !== void 0) {
      const n = this.constructor;
      if (r === !1 && (i = this[e]), s ??= n.getPropertyOptions(e), !((s.hasChanged ?? De)(i, t) || s.useDefault && s.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(n._$Eu(e, s)))) return;
      this.C(e, t, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: s, reflect: r, wrapped: i }, n) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, n ?? t ?? this[e]), i !== !0 || n !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (t = void 0), this._$AL.set(e, t)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, i] of this._$Ep) this[r] = i;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, i] of s) {
        const { wrapped: n } = i, o = this[r];
        n !== !0 || this._$AL.has(r) || o === void 0 || this.C(r, void 0, i, o);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((t) => this._$ET(t, this[t])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
T.elementStyles = [], T.shadowRootOptions = { mode: "open" }, T[P("elementProperties")] = /* @__PURE__ */ new Map(), T[P("finalized")] = /* @__PURE__ */ new Map(), at?.({ ReactiveElement: T }), (j.reactiveElementVersions ??= []).push("2.1.2");
var ee = globalThis, de = (e) => e, F = ee.trustedTypes, he = F ? F.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Pe = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, Ue = "?" + y, ot = `<${Ue}>`, k = document, U = () => k.createComment(""), z = (e) => e === null || typeof e != "object" && typeof e != "function", te = Array.isArray, lt = (e) => te(e) || typeof e?.[Symbol.iterator] == "function", G = `[ 	
\f\r]`, N = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ue = /-->/g, pe = />/g, x = RegExp(`>|${G}(?:([^\\s"'>=/]+)(${G}*=${G}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ge = /'/g, fe = /"/g, ze = /^(?:script|style|textarea|title)$/i, se = (e) => (t, ...s) => ({
  _$litType$: e,
  strings: t,
  values: s
}), u = se(1), _e = se(2), Gt = se(3), A = /* @__PURE__ */ Symbol.for("lit-noChange"), h = /* @__PURE__ */ Symbol.for("lit-nothing"), ve = /* @__PURE__ */ new WeakMap(), $ = k.createTreeWalker(k, 129);
function He(e, t) {
  if (!te(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return he !== void 0 ? he.createHTML(t) : t;
}
var ct = (e, t) => {
  const s = e.length - 1, r = [];
  let i, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = N;
  for (let a = 0; a < s; a++) {
    const c = e[a];
    let g, l, d = -1, f = 0;
    for (; f < c.length && (o.lastIndex = f, l = o.exec(c), l !== null); ) f = o.lastIndex, o === N ? l[1] === "!--" ? o = ue : l[1] !== void 0 ? o = pe : l[2] !== void 0 ? (ze.test(l[2]) && (i = RegExp("</" + l[2], "g")), o = x) : l[3] !== void 0 && (o = x) : o === x ? l[0] === ">" ? (o = i ?? N, d = -1) : l[1] === void 0 ? d = -2 : (d = o.lastIndex - l[2].length, g = l[1], o = l[3] === void 0 ? x : l[3] === '"' ? fe : ge) : o === fe || o === ge ? o = x : o === ue || o === pe ? o = N : (o = x, i = void 0);
    const _ = o === x && e[a + 1].startsWith("/>") ? " " : "";
    n += o === N ? c + ot : d >= 0 ? (r.push(g), c.slice(0, d) + Pe + c.slice(d) + y + _) : c + y + (d === -2 ? a : _);
  }
  return [He(e, n + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, q = class Le {
  constructor({ strings: t, _$litType$: s }, r) {
    let i;
    this.parts = [];
    let n = 0, o = 0;
    const a = t.length - 1, c = this.parts, [g, l] = ct(t, s);
    if (this.el = Le.createElement(g, r), $.currentNode = this.el.content, s === 2 || s === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (i = $.nextNode()) !== null && c.length < a; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const d of i.getAttributeNames()) if (d.endsWith(Pe)) {
          const f = l[o++], _ = i.getAttribute(d).split(y), v = /([.?@])?(.*)/.exec(f);
          c.push({
            type: 1,
            index: n,
            name: v[2],
            strings: _,
            ctor: v[1] === "." ? ht : v[1] === "?" ? ut : v[1] === "@" ? pt : W
          }), i.removeAttribute(d);
        } else d.startsWith(y) && (c.push({
          type: 6,
          index: n
        }), i.removeAttribute(d));
        if (ze.test(i.tagName)) {
          const d = i.textContent.split(y), f = d.length - 1;
          if (f > 0) {
            i.textContent = F ? F.emptyScript : "";
            for (let _ = 0; _ < f; _++) i.append(d[_], U()), $.nextNode(), c.push({
              type: 2,
              index: ++n
            });
            i.append(d[f], U());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Ue) c.push({
        type: 2,
        index: n
      });
      else {
        let d = -1;
        for (; (d = i.data.indexOf(y, d + 1)) !== -1; ) c.push({
          type: 7,
          index: n
        }), d += y.length - 1;
      }
      n++;
    }
  }
  static createElement(t, s) {
    const r = k.createElement("template");
    return r.innerHTML = t, r;
  }
};
function M(e, t, s = e, r) {
  if (t === A) return t;
  let i = r !== void 0 ? s._$Co?.[r] : s._$Cl;
  const n = z(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== n && (i?._$AO?.(!1), n === void 0 ? i = void 0 : (i = new n(e), i._$AT(e, s, r)), r !== void 0 ? (s._$Co ??= [])[r] = i : s._$Cl = i), i !== void 0 && (t = M(e, i._$AS(e, t.values), i, r)), t;
}
var dt = class {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: s } = this._$AD, r = (e?.creationScope ?? k).importNode(t, !0);
    $.currentNode = r;
    let i = $.nextNode(), n = 0, o = 0, a = s[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let c;
        a.type === 2 ? c = new re(i, i.nextSibling, this, e) : a.type === 1 ? c = new a.ctor(i, a.name, a.strings, this, e) : a.type === 6 && (c = new gt(i, this, e)), this._$AV.push(c), a = s[++o];
      }
      n !== a?.index && (i = $.nextNode(), n++);
    }
    return $.currentNode = k, r;
  }
  p(e) {
    let t = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, t), t += s.strings.length - 2) : s._$AI(e[t])), t++;
  }
}, re = class Fe {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, s, r, i) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = r, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && t?.nodeType === 11 && (t = s.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, s = this) {
    t = M(this, t, s), z(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== A && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : lt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && z(this._$AH) ? this._$AA.nextSibling.data = t : this.T(k.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: r } = t, i = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = q.createElement(He(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const n = new dt(i, this), o = n.u(this.options);
      n.p(s), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let s = ve.get(t.strings);
    return s === void 0 && ve.set(t.strings, s = new q(t)), s;
  }
  k(t) {
    te(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let r, i = 0;
    for (const n of t) i === s.length ? s.push(r = new Fe(this.O(U()), this.O(U()), this, this.options)) : r = s[i], r._$AI(n), i++;
    i < s.length && (this._$AR(r && r._$AB.nextSibling, i), s.length = i);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const r = de(t).nextSibling;
      de(t).remove(), t = r;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}, W = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, s, r, i) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(/* @__PURE__ */ new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(e, t = this, s, r) {
    const i = this.strings;
    let n = !1;
    if (i === void 0) e = M(this, e, t, 0), n = !z(e) || e !== this._$AH && e !== A, n && (this._$AH = e);
    else {
      const o = e;
      let a, c;
      for (e = i[0], a = 0; a < i.length - 1; a++) c = M(this, o[s + a], t, a), c === A && (c = this._$AH[a]), n ||= !z(c) || c !== this._$AH[a], c === h ? e = h : e !== h && (e += (c ?? "") + i[a + 1]), this._$AH[a] = c;
    }
    n && !r && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}, ht = class extends W {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}, ut = class extends W {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}, pt = class extends W {
  constructor(e, t, s, r, i) {
    super(e, t, s, r, i), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = M(this, e, t, 0) ?? h) === A) return;
    const s = this._$AH, r = e === h && s !== h || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, i = e !== h && (s === h || r);
    r && this.element.removeEventListener(this.name, this, s), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}, gt = class {
  constructor(e, t, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    M(this, e);
  }
}, ft = ee.litHtmlPolyfillSupport;
ft?.(q, re), (ee.litHtmlVersions ??= []).push("3.3.3");
var _t = (e, t, s) => {
  const r = s?.renderBefore ?? t;
  let i = r._$litPart$;
  if (i === void 0) {
    const n = s?.renderBefore ?? null;
    r._$litPart$ = i = new re(t.insertBefore(U(), n), n, void 0, s ?? {});
  }
  return i._$AI(e), i;
}, ie = globalThis, R = class extends T {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = _t(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return A;
  }
};
R._$litElement$ = !0, R.finalized = !0, ie.litElementHydrateSupport?.({ LitElement: R });
var vt = ie.litElementPolyfillSupport;
vt?.({ LitElement: R });
(ie.litElementVersions ??= []).push("4.2.2");
var mt = {
  ATTRIBUTE: 1,
  CHILD: 2,
  PROPERTY: 3,
  BOOLEAN_ATTRIBUTE: 4,
  EVENT: 5,
  ELEMENT: 6
}, yt = (e) => (...t) => ({
  _$litDirective$: e,
  values: t
}), xt = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, t, s) {
    this._$Ct = e, this._$AM = t, this._$Ci = s;
  }
  _$AS(e, t) {
    return this.update(e, t);
  }
  update(e, t) {
    return this.render(...t);
  }
}, Ie = "important", bt = " !" + Ie, wt = yt(class extends xt {
  constructor(e) {
    if (super(e), e.type !== mt.ATTRIBUTE || e.name !== "style" || e.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(e) {
    return Object.keys(e).reduce((t, s) => {
      const r = e[s];
      return r == null ? t : t + `${s = s.includes("-") ? s : s.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${r};`;
    }, "");
  }
  update(e, [t]) {
    const { style: s } = e.element;
    if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
    for (const r of this.ft) t[r] ?? (this.ft.delete(r), r.includes("-") ? s.removeProperty(r) : s[r] = null);
    for (const r in t) {
      const i = t[r];
      if (i != null) {
        this.ft.add(r);
        const n = typeof i == "string" && i.endsWith(bt);
        r.includes("-") || n ? s.setProperty(r, n ? i.slice(0, -11) : i, n ? Ie : "") : s[r] = i;
      }
    }
    return A;
  }
}), Z = 0.6213711922, $t = 4.184;
function kt(e, t) {
  if (e === null) return "--";
  try {
    return Math.round(e).toLocaleString(t, { maximumFractionDigits: 0 });
  } catch {
    return String(Math.round(e));
  }
}
function At(e) {
  const t = Math.round(e * 60);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function m(e) {
  if (e == null || e === "") return null;
  const t = Number(e);
  return Number.isFinite(t) ? t : null;
}
function p(e, t = "value") {
  return e ? m(e[t]) : null;
}
function b(e, t = 0) {
  return e === null ? "--" : e.toFixed(t);
}
function St(e, t) {
  const s = e ? Date.parse(e) : NaN;
  if (!Number.isFinite(s)) return null;
  const r = Math.max(0, Math.round((t - s) / 6e4));
  return r < 1 ? "now" : r < 60 ? `${r}m` : r < 2880 ? `${Math.round(r / 60)}h` : `${Math.round(r / 1440)}d`;
}
function Et(e, t) {
  const s = e ? Date.parse(e) : NaN;
  return Number.isFinite(s) ? Math.max(0, (t - s) / 6e4) : null;
}
function B(e, t, s, r) {
  try {
    return e.toLocaleString(t, {
      ...s,
      timeZone: r
    });
  } catch {
    return e.toLocaleString(t, s);
  }
}
function me(e, t, s) {
  return B(new Date(e), t, {
    hour: "numeric",
    minute: "2-digit"
  }, s);
}
function H(e, t, s) {
  return B(new Date(e), t, {
    weekday: "short",
    day: "numeric",
    month: "short"
  }, s);
}
function ye(e, t, s) {
  return B(new Date(e), t, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }, s);
}
function xe(e, t, s) {
  return B(new Date(e), t, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  }, s);
}
function E(e, t) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: t,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date(e));
  } catch {
    const s = new Date(e), r = String(s.getMonth() + 1).padStart(2, "0");
    return `${s.getFullYear()}-${r}-${String(s.getDate()).padStart(2, "0")}`;
  }
}
var be = {
  biking: "Cycling",
  biking_stationary: "Indoor cycling",
  running_treadmill: "Treadmill run",
  swimming_pool: "Pool swim",
  swimming_open_water: "Open water swim",
  hiit: "HIIT",
  high_intensity_interval_training: "HIIT"
};
function we(e) {
  if (typeof e == "string" && Object.prototype.hasOwnProperty.call(be, e)) return be[e];
  const t = (typeof e == "string" ? e : "").replace(/[_-]+/g, " ").trim().slice(0, 40);
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Workout";
}
function $e(e) {
  const t = Math.round(Math.abs(e));
  return t < 60 ? `${t} min` : `${Math.floor(t / 60)}h ${String(t % 60).padStart(2, "0")}m`;
}
var Ct = [
  1,
  2,
  2.5,
  5
];
function Tt(e, t, s = 1) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || t < e) return {
    bottom: 0,
    top: 1
  };
  if (t - e < s) {
    const n = (e + t) / 2;
    e = n - s / 2, t = n + s / 2;
  }
  const r = t - e, i = 10 ** Math.floor(Math.log10(r / 8));
  for (const n of [i, i * 10]) for (const o of Ct) {
    const a = o * n, c = Math.floor(e / a + 1e-9) * a;
    let g = Math.ceil((t - c) / a - 1e-9);
    if (g % 2 && (g += 1), g <= 8) return {
      bottom: c,
      top: c + g * a
    };
  }
  return {
    bottom: Math.floor(e),
    top: Math.ceil(t)
  };
}
function ke(e) {
  return Math.abs(e - Math.round(e)) < 1e-6 ? String(Math.round(e)) : e.toFixed(1);
}
var Rt = (e, t = 0, s = 100) => Math.min(s, Math.max(t, e));
function Mt(e, t) {
  return t >= 1e4 && e !== 0 ? `${ke(e / 1e3)}k` : ke(e);
}
function Ae(e) {
  const t = e.bars.filter((l) => Number.isFinite(l.value) && l.value >= 0).slice(-160);
  if (!t.length) return u`<div class="chart-empty">Nothing recorded in this period yet.</div>`;
  const s = typeof e.goal == "number" && e.goal > 0 ? e.goal : null, r = Math.max(...t.map((l) => l.value), s ?? 0, 1), { top: i } = Tt(0, r, 1), n = (l) => Rt(l / i * 100), o = 100 / t.length, a = e.hover !== null ? t[e.hover] : void 0, c = a && e.hover !== null ? (e.hover + 0.5) * o : 0, g = [
    i,
    i / 2,
    0
  ];
  return u`
    <div class="chart ${e.kind}">
      <div class="yaxis">${g.map((l) => u`<span>${Mt(l, i)}</span>`)}</div>
      <div class="plot" role="img" aria-label=${e.description} @pointerleave=${() => e.onHover(null)}>
        ${g.map((l, d) => u`<div class="grid" style="top:${d * 50}%"></div>`)}
        ${s !== null ? u`<div class="goal" style="bottom:${n(s)}%"><span>Goal</span></div>` : h}
        ${t.map((l, d) => u`<button
            class="col ${s !== null && l.value >= s ? "met" : ""} ${l.running ? "running" : ""} ${e.hover === d ? "picked" : ""}"
            style="left:${d * o}%;width:${o}%"
            aria-label="${l.title}: ${e.label} ${e.format(l.value)}"
            @pointerenter=${() => e.onHover(d)}
            @focus=${() => e.onHover(d)}
            @blur=${() => e.onHover(null)}
            @click=${() => e.onHover(d)}
          >
            <i style="height:${n(l.value)}%"></i>
          </button>`)}
        ${a ? u`<div class="tip ${c > 55 ? "left" : ""}" style="left:${c}%">
              <b>${a.title}</b>
              <span class="avg"><i></i>${e.label}<u>${e.format(a.value)}</u></span>
              ${s !== null ? u`<span class="goal-row"><i></i>Goal<u>${e.format(s)}</u></span>` : h}
            </div>` : h}
      </div>
      <div class="xaxis">
        ${t.map((l, d) => {
    if (!l.tick) return h;
    const f = (d + 0.5) * o;
    return u`<span class=${f < 6 ? "" : f > 94 ? "end" : "centered"} style="left:${f}%">${l.tick}</span>`;
  })}
      </div>
    </div>
  `;
}
var je = [
  "steps",
  "exercise",
  "energy",
  "minutes",
  "days",
  "focus",
  "steps_end",
  "exercise_end",
  "energy_end",
  "minutes_end",
  "days_end",
  "focus_end",
  "distance",
  "resting",
  "total",
  "streak",
  "cardio",
  "goal",
  "fresh",
  "recent",
  "stale"
], Se = [
  "30d",
  "6m",
  "1y",
  "all"
], Ee = [
  "3m",
  "6m",
  "1y"
], X = "synthwave", V = {
  theme: {
    colors: {
      steps_end: "#a78bfa",
      exercise_end: "#38bdf8",
      energy_end: "#f97316",
      minutes_end: "#8b5cf6",
      days_end: "#f43f5e",
      focus_end: "#14b8a6"
    },
    tiles: !0
  },
  synthwave: {
    colors: {
      steps: "#ff2fd6",
      exercise: "#5df0a8",
      energy: "#ffb224",
      minutes: "#4df3ff",
      days: "#ff5c8a",
      focus: "#c8f55a",
      steps_end: "#a46bff",
      exercise_end: "#4df3ff",
      energy_end: "#ff7a3d",
      minutes_end: "#3d7bff",
      days_end: "#ff2fd6",
      focus_end: "#5df0a8",
      distance: "#4df3ff",
      resting: "#a46bff",
      total: "#ff5c8a",
      streak: "#ffb224",
      cardio: "#4df3ff",
      goal: "#f1e8ff",
      fresh: "#5df0a8",
      recent: "#ffb224",
      stale: "#ff2fd6"
    },
    vars: {
      "--ar-text": "#f1e8ff",
      "--ar-secondary-text": "#b9a6d6",
      "--ar-divider": "#3b1c66",
      "--ar-track": "rgba(185,166,214,0.10)",
      "--ar-track-opacity": "1",
      "--ar-accent-text": "currentColor",
      "--ar-glow": "6px",
      "--ar-tile-fill": "12%",
      "--ar-tile-border": "45%",
      "--ar-tile-glow": "18%",
      "--ar-tile-inset": "7%",
      "--ar-title-tint": "100%",
      "--ar-halo": "13%",
      "--ar-score-glow": "45%",
      "--ar-today-tint": "#ffb224",
      "--ar-steps-tint": "#ff2fd6",
      "--ar-exercise-tint": "#5df0a8",
      "--ar-workouts-tint": "#4df3ff"
    },
    tiles: !0,
    background: {
      "--ha-card-background": "#16082b",
      "--ha-card-border-color": "#3b1c66"
    }
  },
  vivid: {
    colors: {
      steps: "#bf5af2",
      exercise: "#32ade6",
      energy: "#ff9f0a",
      minutes: "#30d158",
      days: "#ff6482",
      focus: "#ffd60a",
      steps_end: "#5e5ce6",
      exercise_end: "#64d2ff",
      energy_end: "#ff6b5e",
      minutes_end: "#a4e03a",
      days_end: "#bf5af2",
      focus_end: "#ff9f0a",
      distance: "#32ade6",
      resting: "#5e5ce6",
      total: "#ff6482",
      streak: "#ff9f0a",
      cardio: "#32ade6",
      fresh: "#30d158",
      recent: "#ff9f0a",
      stale: "#ff453a"
    },
    tiles: !0
  }
}, Ot = /^(#[0-9a-f]{3,8}|[a-z]+|(rgb|rgba|hsl|hsla)\([0-9.,%\s/deg-]+\)|var\(--[a-z0-9-]+\))$/i;
function Nt(e) {
  if (typeof e != "string") return;
  const t = e.trim();
  return Ot.test(t) ? t : void 0;
}
function We(e) {
  const t = typeof e == "string" ? e : X;
  return Object.prototype.hasOwnProperty.call(V, t) ? V[t] : V[X];
}
function Be(e) {
  return We(e).tiles ?? !1;
}
function Dt(e, t, s = !1) {
  const r = We(e), i = {
    ...r.vars ?? {},
    ...s ? {} : r.background ?? {}
  };
  for (const n of je) {
    const o = Nt(t?.[n]) ?? r.colors[n];
    o && (i[`--ar-${n.replace("_", "-")}`] = o);
  }
  return i;
}
var Ge, Ce = "active-rings-card-editor", Ze = {
  entity: "ActiveRings entity",
  name: "Title",
  preset: "Colour preset",
  show_rows: "A row for each ring",
  show_today: "Today's distance and energy",
  show_steps: "Steps chart, average, streak and best day",
  show_exercise: "Exercise chart",
  show_workouts: "Recent workouts",
  tiles: "Tinted boxes",
  theme_background: "Use the theme's card background",
  workouts_shown: "Workouts in the list",
  steps_range: "Steps chart opens on",
  exercise_range: "Exercise chart opens on",
  distance_unit: "Distance unit",
  energy_unit: "Energy unit",
  colors: "Colours",
  steps: "Ring and chart: Steps",
  steps_end: "Ring and chart: Steps (gradient end)",
  exercise: "Ring and chart: Exercise",
  exercise_end: "Ring and chart: Exercise (gradient end)",
  energy: "Ring: Energy",
  energy_end: "Ring: Energy (gradient end)",
  minutes: "Ring: Active minutes",
  minutes_end: "Ring: Active minutes (gradient end)",
  days: "Ring: Active days",
  days_end: "Ring: Active days (gradient end)",
  focus: "Ring: Focus activity, and its workouts in the list",
  focus_end: "Ring: Focus activity (gradient end)",
  distance: "Distance",
  resting: "Resting energy",
  total: "Total burn",
  streak: "Goal streak",
  cardio: "Workout list: everything but the focus activity",
  goal: "Goal line on the charts",
  fresh: "Good: synced recently, set complete",
  recent: "Fair: synced hours ago, set nearly complete",
  stale: "Poor: synced long ago"
}, Pt = {
  entity: "Any entity of the ActiveRings device. The card reads all its figures from the integration.",
  colors: "Any CSS colour, for example #ff2fd6. Leave a field empty to use the preset.",
  theme_background: "Off: the Synthwave preset paints its own dark card.",
  distance_unit: "Empty: follows Home Assistant's unit system.",
  workouts_shown: "1 to 12."
}, w = (e) => ({
  name: e,
  selector: { boolean: {} }
}), D = (e, t) => ({
  name: e,
  selector: { select: {
    mode: "dropdown",
    options: t
  } }
}), Ut = [
  {
    name: "entity",
    required: !0,
    selector: { entity: { filter: {
      integration: "active_rings",
      domain: "sensor"
    } } }
  },
  {
    name: "name",
    selector: { text: {} }
  },
  D("preset", [
    {
      value: "synthwave",
      label: "Synthwave"
    },
    {
      value: "theme",
      label: "Follow the theme (light or dark)"
    },
    {
      value: "vivid",
      label: "Vivid"
    }
  ]),
  {
    type: "grid",
    name: "",
    schema: [
      w("show_rows"),
      w("show_today"),
      w("show_steps"),
      w("show_exercise"),
      w("show_workouts"),
      w("tiles"),
      w("theme_background")
    ]
  },
  {
    type: "grid",
    name: "",
    schema: [
      D("steps_range", [
        {
          value: "30d",
          label: "30 days"
        },
        {
          value: "6m",
          label: "6 months"
        },
        {
          value: "1y",
          label: "1 year"
        },
        {
          value: "all",
          label: "Everything"
        }
      ]),
      D("exercise_range", [
        {
          value: "3m",
          label: "3 months"
        },
        {
          value: "6m",
          label: "6 months"
        },
        {
          value: "1y",
          label: "1 year"
        }
      ]),
      D("distance_unit", [{
        value: "km",
        label: "Kilometres"
      }, {
        value: "mi",
        label: "Miles"
      }]),
      D("energy_unit", [{
        value: "kcal",
        label: "Kilocalories"
      }, {
        value: "kJ",
        label: "Kilojoules"
      }])
    ]
  },
  {
    name: "workouts_shown",
    selector: { number: {
      min: 1,
      max: 12,
      step: 1,
      mode: "box"
    } }
  },
  {
    type: "expandable",
    name: "colors",
    title: Ze.colors,
    schema: je.map((e) => ({
      name: e,
      selector: { text: {} }
    }))
  }
], Ve = class extends R {
  setConfig(e) {
    this._config = e;
  }
  render() {
    if (!this._config) return h;
    const e = {
      preset: X,
      show_rows: !0,
      show_today: !0,
      show_steps: !0,
      show_exercise: !0,
      show_workouts: !0,
      steps_range: "30d",
      exercise_range: "6m",
      energy_unit: "kcal",
      workouts_shown: 5,
      theme_background: !1,
      tiles: Be(this._config.preset),
      ...this._config
    };
    return u`
      <ha-form
        .hass=${this.hass}
        .data=${e}
        .schema=${Ut}
        .computeLabel=${(t) => Ze[t.name] ?? t.name}
        .computeHelper=${(t) => Pt[t.name]}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
  _valueChanged(e) {
    e.stopPropagation();
    const t = { ...e.detail.value };
    t.distance_unit || delete t.distance_unit;
    const s = Number(t.workouts_shown);
    if (Number.isFinite(s) && s >= 1 ? t.workouts_shown = Math.min(12, Math.round(s)) : delete t.workouts_shown, t.colors) {
      const r = Object.fromEntries(Object.entries(t.colors).filter(([, i]) => typeof i == "string" && i.trim()));
      Object.keys(r).length ? t.colors = r : delete t.colors;
    }
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: t },
      bubbles: !0,
      composed: !0
    }));
  }
};
Ge = Ve;
Ge.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 }
};
customElements.get(Ce) || customElements.define(Ce, Ve);
var zt = Xe`
  :host {
    display: block;
    container-type: inline-size;
  }

  /* Colour tokens live on ha-card, where the preset's --ar-* values are set inline. */
  ha-card {
    --_steps: var(--ar-steps, var(--active-rings-steps-color, #d946ef));
    --_exercise: var(--ar-exercise, var(--active-rings-exercise-color, #14b8a6));
    --_energy: var(--ar-energy, var(--active-rings-energy-color, #f59e0b));
    --_minutes: var(--ar-minutes, var(--active-rings-minutes-color, #6366f1));
    --_days: var(--ar-days, var(--active-rings-days-color, #ec4899));
    --_distance: var(--ar-distance, var(--active-rings-distance-color, #0ea5e9));
    --_resting: var(--ar-resting, var(--active-rings-resting-color, #8b5cf6));
    --_total: var(--ar-total, var(--active-rings-total-color, #ec4899));
    --_streak: var(--ar-streak, var(--active-rings-streak-color, #f59e0b));
    --_focus: var(--ar-focus, var(--active-rings-focus-color, #22c55e));
    --_cardio: var(--ar-cardio, var(--active-rings-cardio-color, #0ea5e9));
    --_fresh: var(--ar-fresh, var(--active-rings-fresh-color, #22c55e));
    --_recent: var(--ar-recent, var(--active-rings-recent-color, #f59e0b));
    --_stale: var(--ar-stale, var(--active-rings-stale-color, #ef4444));
    --_text: var(--ar-text, var(--primary-text-color, #1c1c1e));
    --_text2: var(--ar-secondary-text, var(--secondary-text-color, #6b6b70));
    --_goal: var(--ar-goal, var(--active-rings-goal-color, var(--_text)));
    --_divider: var(--ar-divider, var(--divider-color, rgba(127, 127, 127, 0.25)));
    --_accent-text: var(--ar-accent-text, var(--_text));
    --_glow: var(--ar-glow, 0px);
    --_surface: var(--ha-card-background, var(--card-background-color, #fff));
  }

  ha-card {
    display: block;
    padding: 16px;
    color: var(--_text);
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
  }

  /* Marker beside the title: how long ago the health data last arrived */
  .age {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid color-mix(in srgb, currentColor 45%, transparent);
    background: color-mix(in srgb, currentColor 12%, transparent);
  }
  .age.fresh {
    color: var(--_fresh);
  }
  .age.recent {
    color: var(--_recent);
  }
  .age.stale {
    color: var(--_stale);
  }

  /* Two sets of rings, each under a heading that says which stretch of time it
     covers; in each, the rings sit beside a row per ring */
  .group {
    min-width: 0;
  }
  .set-head {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--_text2);
  }
  .set-head b {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--_text);
  }
  .set-head em {
    margin-left: auto;
    padding: 1px 8px;
    border-radius: 999px;
    font-style: normal;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid var(--_divider);
  }
  .sets {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .set {
    display: flex;
    align-items: center;
    gap: 20px;
    min-width: 0;
  }
  .rings {
    position: relative;
    flex: 0 0 164px;
    width: 164px;
    height: 164px;
  }
  .rings svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    overflow: visible;
  }
  .track,
  .fill {
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
  }
  .track {
    stroke: var(--ar-track, currentColor);
    opacity: var(--ar-track-opacity, 0.16);
  }
  .fill {
    transition:
      stroke-dashoffset 0.7s ease,
      stroke-dasharray 0.7s ease;
    filter: drop-shadow(0 0 calc(var(--_glow) * 0.5) color-mix(in srgb, currentColor 55%, transparent));
  }
  .fill.empty {
    opacity: 0;
  }
  .c-steps {
    color: var(--_steps);
    --end: var(--ar-steps-end, var(--_steps));
  }
  .c-exercise {
    color: var(--_exercise);
    --end: var(--ar-exercise-end, var(--_exercise));
  }
  .c-energy {
    color: var(--_energy);
    --end: var(--ar-energy-end, var(--_energy));
  }
  .c-minutes {
    color: var(--_minutes);
    --end: var(--ar-minutes-end, var(--_minutes));
  }
  .c-days {
    color: var(--_days);
    --end: var(--ar-days-end, var(--_days));
  }
  .c-focus {
    color: var(--_focus);
    --end: var(--ar-focus-end, var(--_focus));
  }

  .center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    pointer-events: none;
    color: var(--_text);
  }
  .score {
    font-size: 30px;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }
  .band {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    color: var(--_text2);
  }
  .band-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--band, var(--_text2));
    box-shadow: 0 0 var(--_glow) var(--band, transparent);
  }
  /* How far the set is: the colour of the dot and of the glow. A part-filled
     set is on its way, not poor, so there is no red here. */
  .b-done {
    --band: var(--_fresh);
  }
  .b-close {
    --band: var(--_recent);
  }

  .rows {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .row-head {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 13px;
  }
  .dot {
    align-self: center;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    flex: none;
  }
  .row-name {
    flex: 1;
    font-weight: 600;
    color: var(--_accent-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row-value {
    color: var(--_text2);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .row-value b {
    color: var(--_text);
    font-size: 15px;
    font-weight: 700;
  }
  .bar {
    height: 5px;
    margin: 5px 0 4px;
    border-radius: 3px;
    background: var(--ar-track, color-mix(in srgb, currentColor 16%, transparent));
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, currentColor, var(--end, currentColor));
    box-shadow: 0 0 var(--_glow) color-mix(in srgb, currentColor 60%, transparent);
    transition: width 0.7s ease;
  }
  /* A ring of the week shows its seven days: a small column for each, today last */
  .strip {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
    margin: 6px 0 5px;
  }
  .strip span {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 0;
  }
  .strip i {
    position: relative;
    display: block;
    width: 100%;
    height: 16px;
    border-radius: 4px;
    background: var(--ar-track, color-mix(in srgb, currentColor 16%, transparent));
    overflow: hidden;
  }
  .strip i::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: var(--f, 0%);
    background: linear-gradient(0deg, var(--end, currentColor), currentColor);
    opacity: 0.4;
    transition: height 0.7s ease;
  }
  .strip .on i::after {
    opacity: 1;
    box-shadow: 0 0 var(--_glow) color-mix(in srgb, currentColor 60%, transparent);
  }
  .strip u {
    font-size: 9px;
    line-height: 10px;
    text-decoration: none;
    color: var(--_text2);
  }
  .strip .now u {
    font-weight: 700;
    color: var(--_text);
  }
  .row-detail {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--_text2);
  }
  .row-detail span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row-detail span:last-child {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .row-detail .reached {
    color: var(--_fresh);
    font-weight: 600;
  }

  /* Information box of a ring: floats under its row, or above it near the card's bottom edge */
  .row {
    position: relative;
    cursor: help;
  }
  .row:focus-visible {
    outline: 2px solid var(--_text2);
    outline-offset: 2px;
    border-radius: 14px;
  }
  .info {
    position: absolute;
    z-index: 5;
    top: calc(100% + 6px);
    right: 0;
    width: max(100%, 250px);
    max-width: 340px;
    box-sizing: border-box;
    padding: 9px 11px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.4;
    color: #f4f1fa;
    background: #120e1c;
    border: 1px solid color-mix(in srgb, currentColor 55%, rgba(255, 255, 255, 0.14));
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45);
    pointer-events: none;
  }
  .info.above {
    top: auto;
    bottom: calc(100% + 6px);
  }
  .info b {
    display: block;
    font-size: 13px;
    font-weight: 600;
  }
  .info p {
    margin: 5px 0 0;
    color: #d9d2ea;
  }
  .info i {
    font-style: normal;
    font-weight: 600;
    color: #f4f1fa;
    margin-right: 6px;
  }

  /* Sections under the rings */
  .section {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--_divider);
    min-width: 0;
  }
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 24px;
    font-size: 12px;
    color: var(--_text2);
    margin-bottom: 8px;
  }
  .section-head > span:first-child {
    font-weight: 600;
    color: var(--_text);
  }
  .section.today {
    --tint: var(--ar-today-tint, var(--_energy));
  }
  .section.steps {
    --tint: var(--ar-steps-tint, var(--_steps));
  }
  .section.exercise {
    --tint: var(--ar-exercise-tint, var(--_exercise));
  }
  .section.workouts {
    --tint: var(--ar-workouts-tint, var(--_cardio));
  }

  /* Small switch for a chart's period */
  .seg {
    display: inline-flex;
    border: 1px solid var(--_divider);
    border-radius: 8px;
    overflow: hidden;
  }
  .seg button {
    font: inherit;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    padding: 5px 8px;
    border: 0;
    background: none;
    color: var(--_text2);
    cursor: pointer;
  }
  .seg button + button {
    border-left: 1px solid var(--_divider);
  }
  .seg button:hover {
    color: var(--_text);
  }
  .seg button[aria-pressed="true"] {
    color: var(--_text);
    background: color-mix(in srgb, var(--tint, var(--_text)) 22%, transparent);
  }
  .seg button:focus-visible {
    outline: 2px solid var(--_text2);
    outline-offset: -2px;
  }

  /* Colour of a tile, a chart or a workout */
  .k-steps {
    --k: var(--_steps);
    --k2: var(--ar-steps-end, var(--_steps));
  }
  .k-exercise {
    --k: var(--_exercise);
    --k2: var(--ar-exercise-end, var(--_exercise));
  }
  .k-energy {
    --k: var(--_energy);
  }
  .k-distance {
    --k: var(--_distance);
  }
  .k-resting {
    --k: var(--_resting);
  }
  .k-total {
    --k: var(--_total);
  }
  .k-streak {
    --k: var(--_streak);
  }
  .k-minutes {
    --k: var(--_minutes);
  }
  .k-focus {
    --k: var(--_focus);
  }
  .k-cardio {
    --k: var(--_cardio);
  }

  /* Figures: name, value and a note */
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
    gap: 12px 16px;
  }
  .stat {
    min-width: 0;
    color: var(--k, currentColor);
  }
  .stat-head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }
  .stat-name {
    color: var(--_text2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .stat-value {
    margin-top: 2px;
    font-size: 12px;
    color: var(--_text2);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .stat-value b {
    color: var(--_text);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .stat-note {
    margin-top: 3px;
    font-size: 11px;
    color: var(--_text2);
    font-variant-numeric: tabular-nums;
  }

  /* Bar charts */
  .chart {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 6px;
  }
  .yaxis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 112px;
    margin: -5px 0;
    font-size: 10px;
    line-height: 10px;
    text-align: right;
    color: var(--_text2);
    font-variant-numeric: tabular-nums;
  }
  .plot {
    position: relative;
    height: 102px;
  }
  .grid {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1px dashed var(--_divider);
  }
  /* One column per bar, full height so the whole column answers to the pointer */
  .col {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0;
    border: 0;
    background: none;
    cursor: crosshair;
  }
  .col i {
    display: block;
    width: 72%;
    max-width: 22px;
    min-height: 2px;
    border-radius: 3px 3px 1px 1px;
    background: linear-gradient(0deg, var(--k2, var(--k)), var(--k));
    opacity: 0.45;
    transition: height 0.5s ease;
  }
  .col.met i {
    opacity: 1;
    box-shadow: 0 0 var(--_glow) color-mix(in srgb, var(--k) 45%, transparent);
  }
  .col.running i {
    background: repeating-linear-gradient(
      -45deg,
      var(--k),
      var(--k) 3px,
      color-mix(in srgb, var(--k) 45%, transparent) 3px,
      color-mix(in srgb, var(--k) 45%, transparent) 6px
    );
  }
  .col.picked i,
  .col:hover i {
    opacity: 1;
    filter: brightness(1.15);
  }
  .col:focus-visible {
    outline: 1px solid var(--_text2);
    outline-offset: -1px;
  }
  .goal {
    position: absolute;
    left: 0;
    right: 0;
    height: 0;
    z-index: 1;
    border-top: 1px dashed color-mix(in srgb, var(--_goal) 70%, transparent);
    pointer-events: none;
  }
  .goal span {
    position: absolute;
    right: 0;
    bottom: 2px;
    padding: 0 4px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 600;
    line-height: 12px;
    color: var(--_goal);
    background: color-mix(in srgb, var(--_surface) 70%, transparent);
  }
  /* The box floats over the chart, so showing it never moves the layout. */
  .tip {
    position: absolute;
    pointer-events: none;
    top: 4px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-left: 10px;
    padding: 6px 9px;
    border-radius: 8px;
    font-size: 11px;
    white-space: nowrap;
    color: #f4f1fa;
    background: rgba(18, 14, 28, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  }
  .tip.left {
    margin-left: -10px;
    transform: translateX(-100%);
  }
  .tip b {
    font-weight: 600;
  }
  .tip span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .tip u {
    margin-left: auto;
    padding-left: 12px;
    text-decoration: none;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .tip i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--k);
  }
  .tip .goal-row i {
    height: 0;
    border-radius: 0;
    background: none;
    border-top: 2px dashed #f4f1fa;
  }
  .xaxis {
    position: relative;
    grid-column: 2;
    height: 14px;
    margin-top: 3px;
    font-size: 10px;
    color: var(--_text2);
  }
  .xaxis span {
    position: absolute;
    white-space: nowrap;
  }
  .xaxis span.centered {
    transform: translateX(-50%);
  }
  .xaxis span.end {
    transform: translateX(-100%);
  }
  .chart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 119px;
    font-size: 12px;
    color: var(--_text2);
    text-align: center;
  }
  .chart-note {
    margin-top: 4px;
    font-size: 11px;
    color: var(--_text2);
    text-align: center;
  }

  /* Workouts: one line each, newest first */
  .workouts-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .workout {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    column-gap: 8px;
    align-items: baseline;
    padding: 7px 0;
    color: var(--k);
  }
  .workout + .workout {
    border-top: 1px solid color-mix(in srgb, var(--_divider) 70%, transparent);
  }
  .workout .dot {
    align-self: center;
    box-shadow: 0 0 var(--_glow) currentColor;
  }
  .workout-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--_text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .workout-name small {
    font-size: 12px;
    font-weight: 400;
    color: var(--_text2);
  }
  .workout-when {
    font-size: 11px;
    color: var(--_text2);
    white-space: nowrap;
  }
  .workout-detail {
    grid-column: 2 / -1;
    margin-top: 1px;
    font-size: 12px;
    color: var(--_text2);
    font-variant-numeric: tabular-nums;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .workouts-foot {
    margin-top: 6px;
    padding-top: 8px;
    border-top: 1px solid var(--_divider);
    font-size: 11px;
    color: var(--_text2);
  }
  .empty-note {
    padding: 14px 0;
    font-size: 12px;
    color: var(--_text2);
    text-align: center;
  }

  /* Tiles: every part in its own tinted, softly glowing box */
  ha-card.tiles {
    --_glow: var(--ar-glow, 3px);
  }
  .tiles .rows {
    gap: 8px;
  }
  .tiles .row,
  .tiles .section {
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--tint, currentColor) var(--ar-tile-border, 24%), transparent);
    background: color-mix(in srgb, var(--tint, currentColor) var(--ar-tile-fill, 7%), transparent);
    box-shadow:
      0 0 16px color-mix(in srgb, var(--tint, currentColor) var(--ar-tile-glow, 9%), transparent),
      inset 0 0 20px color-mix(in srgb, var(--tint, currentColor) var(--ar-tile-inset, 0%), transparent);
  }
  .tiles .section {
    margin-top: 12px;
  }
  .tiles .section-head > span:first-child {
    color: color-mix(in srgb, var(--tint) var(--ar-title-tint, 0%), var(--_text));
  }
  .tiles .bar {
    margin-bottom: 5px;
  }
  .tiles .rings {
    isolation: isolate;
  }
  .tiles .rings::before {
    content: "";
    position: absolute;
    inset: -14px;
    z-index: -1;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--band, transparent) var(--ar-halo, 7%), transparent) 0%,
      transparent 68%
    );
    pointer-events: none;
  }
  .tiles .score {
    text-shadow: 0 0 12px color-mix(in srgb, var(--band, transparent) var(--ar-score-glow, 0%), transparent);
  }

  .message {
    font-size: 13px;
    color: var(--_text2);
    padding: 8px 0;
  }

  /* A slim card: rings above their rows */
  @container (max-width: 419px) {
    .set {
      flex-direction: column;
      align-items: stretch;
      gap: 14px;
    }
    .rings {
      align-self: center;
    }
  }

  /* Two dashboard columns and wider: the two sets side by side, today's
     figures across the card, then the charts side by side and the workouts
     across the card. */
  @container (min-width: 640px) {
    .sets {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 12px 28px;
      align-items: stretch;
    }
    /* The two sets stand side by side with rows of different heights (a week's
       row holds seven columns). Both sets take the height of the taller one and
       today's rows grow to match, so the rings are level and so are the rows. */
    .group {
      display: flex;
      flex-direction: column;
    }
    .group > .set {
      flex: 1 1 auto;
      align-items: stretch;
    }
    .rings {
      align-self: center;
    }
    .rows > .row {
      flex: 1 1 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .panels {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      column-gap: 28px;
      align-items: stretch;
    }
    .tiles .panels {
      column-gap: 12px;
    }
    .panels > .section.today,
    .panels > .section.workouts,
    .panels.n1 > .section {
      grid-column: 1 / -1;
    }
    /* A chart alone in its row takes the row. */
    .panels.one-chart > .section.steps,
    .panels.one-chart > .section.exercise {
      grid-column: 1 / -1;
    }
    .section.today .stats {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  /* Between two and three columns each set is slim: rings above the rows */
  @container (min-width: 640px) and (max-width: 959px) {
    .set {
      flex-direction: column;
      align-items: stretch;
      gap: 14px;
    }
    .rings {
      align-self: center;
    }
  }

  /* Three columns: steps, exercise and workouts side by side */
  @container (min-width: 960px) {
    .panels.three {
      grid-template-columns: minmax(0, 6fr) minmax(0, 5fr) minmax(0, 5fr);
    }
    .panels.three > .section.workouts {
      grid-column: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fill,
    .bar-fill,
    .strip i::after,
    .col i {
      transition: none;
    }
  }
`, ne, Ht = "1.1.0", I = "active-rings-card", Ye = 36e5, C = 24 * Ye, Lt = [{
  key: "today",
  label: "Today",
  heading: "Today",
  note: "Since midnight",
  score: "today_score",
  rings: [
    {
      id: "steps",
      label: "Steps",
      metric: "steps"
    },
    {
      id: "exercise",
      label: "Exercise",
      metric: "exercise"
    },
    {
      id: "energy",
      label: "Energy",
      metric: "active_energy"
    }
  ]
}, {
  key: "week",
  label: "7 days",
  heading: "Last 7 days",
  note: "Rolling week",
  score: "week_score",
  rings: [{
    id: "minutes",
    label: "Active minutes",
    metric: "exercise_week"
  }, {
    id: "days",
    label: "Active days",
    metric: "active_days_week"
  }]
}], Te = {
  strength: "Strength",
  running: "Running",
  walking: "Walking",
  hiking: "Hiking",
  cycling: "Cycling",
  swimming: "Swimming",
  rowing: "Rowing",
  yoga: "Yoga",
  pilates: "Pilates",
  hiit: "HIIT",
  dancing: "Dancing"
}, Ft = {
  steps: {
    title: "Steps today",
    about: "Every step your phone and watch have counted since midnight.",
    scoring: "Full at your daily steps goal."
  },
  exercise: {
    title: "Exercise today",
    about: "Minutes of brisk movement today: workouts, and any other stretch your watch counts as exercise.",
    scoring: "Full at your daily exercise goal."
  },
  energy: {
    title: "Active energy today",
    about: "The energy you have burned by moving today, on top of what your body uses at rest.",
    scoring: "Full at your daily active energy goal."
  },
  minutes: {
    title: "Active minutes, last 7 days",
    about: "Your exercise minutes over the last seven days, today included.",
    scoring: "Full at your goal for seven days. The World Health Organization advises adults at least 150 minutes of moderate activity a week."
  }
}, Y = {
  "30d": {
    label: "30D",
    days: 30,
    period: "day"
  },
  "6m": {
    label: "6M",
    days: 183,
    period: "week"
  },
  "1y": {
    label: "1Y",
    days: 366,
    period: "week"
  },
  all: {
    label: "All",
    days: 8760,
    period: "month"
  }
}, Re = {
  "3m": {
    label: "3M",
    days: 92
  },
  "6m": {
    label: "6M",
    days: 183
  },
  "1y": {
    label: "1Y",
    days: 366
  }
}, It = ["steps", "exercise"], jt = 2, Wt = 10, Me = 12, Bt = 6, Oe = (e) => Math.min(1, Math.max(0, e)), Ke = class extends R {
  constructor() {
    super(), this._ticks = 0, this._token = 0, this._seriesTokens = {}, this._summary = null, this._series = {}, this._stepsRange = "30d", this._exerciseRange = "6m", this._hover = null, this._tip = null, this._tipAbove = !1, this._error = null, this._now = Date.now(), this._ready = !1;
  }
  static getConfigElement() {
    return document.createElement("active-rings-card-editor");
  }
  static getStubConfig(e) {
    return { entity: Object.keys(e?.entities ?? {}).find((t) => t.startsWith("sensor.") && e?.entities?.[t]?.platform === "active_rings") ?? "" };
  }
  setConfig(e) {
    if (!e || typeof e != "object") throw new Error("Active Rings: the card configuration is missing");
    this._config = {
      show_rows: !0,
      show_today: !0,
      show_steps: !0,
      show_exercise: !0,
      show_workouts: !0,
      ...e
    };
    const t = this._config.steps_range;
    this._stepsRange = t && Se.includes(t) ? t : "30d";
    const s = this._config.exercise_range;
    this._exerciseRange = s && Ee.includes(s) ? s : "6m", this._loadedFor = void 0;
  }
  getCardSize() {
    const e = this._config;
    return 4 + (e?.show_today ? 2 : 0) + (e?.show_steps ? 4 : 0) + (e?.show_exercise ? 4 : 0) + (e?.show_workouts ? 4 : 0);
  }
  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: "auto"
    };
  }
  connectedCallback() {
    super.connectedCallback(), this._timer = window.setInterval(() => this._tick(), 6e4);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.clearInterval(this._timer), this._timer = void 0;
  }
  _tick() {
    this._now = Date.now(), this._ticks += 1, this._ticks % jt === 0 && this._load(this._ticks % Wt === 0);
  }
  shouldUpdate(e) {
    if (e.size > 1 || !e.has("hass")) return !0;
    const t = this._config?.entity;
    return !t || !this._summary ? !0 : e.get("hass")?.states[t] !== this.hass?.states[t];
  }
  firstUpdated() {
    requestAnimationFrame(() => this._ready = !0);
  }
  updated() {
    const e = this._config?.entity;
    if (!this.hass || !e) return;
    const t = this.hass.states[e];
    if (this._loadedFor !== e || t !== this._seen) {
      const s = this._loadedFor !== e;
      this._loadedFor = e, this._seen = t, s && (this._summary = null, this._series = {}), this._load(!0);
    }
  }
  async _load(e) {
    const t = this._config?.entity, s = this.hass?.callWS;
    if (!t || !s) return;
    const r = ++this._token;
    try {
      const i = await s({
        type: "active_rings/summary",
        entity_id: t
      });
      if (r !== this._token) return;
      const n = i && typeof i.metrics == "object" && i.metrics ? i.metrics : {};
      this._summary = {
        updated: i?.updated ?? null,
        synced: i?.synced ?? null,
        metrics: n,
        focus: typeof i?.focus == "string" && i.focus ? i.focus.slice(0, 40) : "strength",
        workouts: Array.isArray(i?.workouts) ? i.workouts.slice(0, Me) : [],
        workouts_since: typeof i?.workouts_since == "string" ? i.workouts_since : null
      }, this._error = null, this._now = Date.now();
    } catch {
      r === this._token && (this._error = "ActiveRings did not answer. Check that the integration is set up and loaded.");
      return;
    }
    if (e) for (const i of It) this._loadSeries(i);
  }
  _request(e) {
    if (e === "steps") {
      const t = Y[this._stepsRange];
      return {
        metric: "steps",
        period: t.period,
        start: Date.now() - t.days * C
      };
    }
    return {
      metric: "exercise",
      period: "week",
      start: Date.now() - Re[this._exerciseRange].days * C
    };
  }
  _wanted(e) {
    const t = this._config;
    return e === "steps" ? t?.show_steps !== !1 : t?.show_exercise !== !1;
  }
  async _loadSeries(e) {
    const t = this._config?.entity, s = this.hass?.callWS;
    if (!t || !s || !this._wanted(e)) return;
    const r = (this._seriesTokens[e] ?? 0) + 1;
    this._seriesTokens[e] = r;
    const i = this._request(e);
    let n = [];
    try {
      const o = await s({
        type: "active_rings/series",
        entity_id: t,
        metric: i.metric,
        period: i.period,
        start: new Date(i.start).toISOString()
      });
      Array.isArray(o?.points) && (n = o.points.filter((a) => Number.isFinite(a?.start) && Number.isFinite(a?.end) && Number.isFinite(a?.value) && a.end > a.start && a.value >= 0 && a.start >= i.start - 2 * Ye).map((a) => ({
        start: a.start,
        end: a.end,
        value: a.value,
        days: Number.isFinite(a.days) && a.days >= 1 ? a.days : 1
      })).slice(-800));
    } catch {
    }
    this._seriesTokens[e] === r && (this._series = {
      ...this._series,
      [e]: n
    });
  }
  _metric(e) {
    return this._summary?.metrics[e];
  }
  get _language() {
    return this.hass?.locale?.language;
  }
  get _timeZone() {
    return this.hass?.config?.time_zone;
  }
  get _miles() {
    const e = this._config?.distance_unit;
    return e === "km" || e === "mi" ? e === "mi" : this.hass?.config?.unit_system?.length === "mi";
  }
  get _energyUnit() {
    return this._config?.energy_unit === "kJ" ? "kJ" : "kcal";
  }
  get _energyFactor() {
    return this._energyUnit === "kJ" ? $t : 1;
  }
  _count(e) {
    return kt(e, this._language);
  }
  render() {
    const e = this._config;
    if (!e) return h;
    const t = Dt(e.preset, e.colors, e.theme_background), s = e.entity ? this.hass?.states[e.entity] : void 0, r = this._summary;
    let i = "";
    e.entity ? this.hass && !s ? i = `Entity not found: ${e.entity}` : this._error ? i = this._error : r && !Object.keys(r.metrics).length && (i = "No activity data yet. The figures appear after the next sync.") : i = "Choose an ActiveRings entity in the card settings.";
    const n = e.show_steps ? this._renderSteps() : h, o = e.show_exercise ? this._renderExercise() : h, a = e.show_workouts ? this._renderWorkouts() : h, c = [
      e.show_today ? this._renderToday() : h,
      n,
      o,
      a
    ].filter((d) => d !== h), g = (n !== h ? 1 : 0) + (o !== h ? 1 : 0), l = [
      `n${c.length}`,
      g === 1 ? "one-chart" : "",
      g === 2 && a !== h ? "three" : ""
    ].join(" ");
    return u`
      <ha-card class=${e.tiles ?? Be(e.preset) ? "tiles" : ""} style=${wt(t)}>
        <div class="header">
          <span class="title">${e.name ?? "Activity"}</span>
          ${this._renderSynced()}
        </div>
        ${i ? u`<div class="message">${i}</div>` : h}
        <div class="body">
          <div class="sets">${this._sets.map((d) => this._renderSet(d, e.show_rows !== !1))}</div>
          ${c.length ? u`<div class="panels ${l}">${c}</div>` : h}
        </div>
      </ha-card>
    `;
  }
  _renderSynced() {
    const e = this._summary?.synced, t = Et(e, this._now), s = St(e, this._now);
    if (t === null || s === null) return h;
    const r = t <= 120 ? "fresh" : t <= 360 ? "recent" : "stale", i = `Health data last arrived ${xe(Date.parse(e), this._language, this._timeZone)}`;
    return u`<span class="age ${r}" title=${i}>${s === "now" ? "Synced just now" : `Synced ${s} ago`}</span>`;
  }
  _fraction(e) {
    return !this._ready || e === null ? 0 : Oe(e / 100);
  }
  _amount(e, t) {
    if (e === "steps") return `${this._count(t)} steps`;
    if (e === "exercise" || e === "minutes") return `${this._count(t)} min`;
    if (e === "energy") return `${this._count(t * this._energyFactor)} ${this._energyUnit}`;
    const s = Math.round(t);
    return `${s} ${s === 1 ? "day" : "days"}`;
  }
  _reading(e, t) {
    const s = p(t), r = p(t, "goal");
    if (s === null) return "Nothing counted yet";
    if (r === null) return this._amount(e.id, s);
    const i = this._amount(e.id, r);
    return `${e.id === "energy" ? this._count(s * this._energyFactor) : this._count(s)} of ${i}`;
  }
  _left(e, t) {
    const s = p(t), r = p(t, "goal");
    return s === null || r === null ? {
      text: "",
      reached: !1
    } : s >= r ? {
      text: "Goal reached",
      reached: !0
    } : {
      text: `${this._amount(e.id, r - s)} to go`,
      reached: !1
    };
  }
  _openTip(e, t) {
    const s = t.currentTarget.getBoundingClientRect(), r = this.getBoundingClientRect();
    this._tipAbove = r.bottom - s.bottom < 200 && s.top - r.top > r.bottom - s.bottom, this._tip = e;
  }
  _info(e, t) {
    if (e.id === "days") {
      const s = p(t, "threshold");
      return {
        title: "Active days, last 7 days",
        about: `On how many of the last seven days you reached your daily exercise goal${s !== null ? ` of ${this._count(s)} minutes` : ""}. Today counts once it gets there. The seven columns are the seven days, today last.`,
        scoring: "Full at your active days goal."
      };
    }
    if (e.id === "focus") {
      const s = this._summary?.focus === "strength";
      return {
        title: `${e.label}, last 7 days`,
        about: `On how many of the last seven days you recorded your focus activity, ${e.label.toLowerCase()}${s ? " (weights, functional strength, core or bodyweight training)" : ""}. You choose the focus activity under the integration's Configure.`,
        scoring: `Full at your goal for the focus activity.${s ? " The World Health Organization advises muscle strengthening on 2 or more days a week." : ""}`
      };
    }
    return Ft[e.id];
  }
  _renderInfo(e, t) {
    const s = this._info(e, t), r = p(t, "percent"), i = p(t, "days_known"), n = this._summary?.workouts_since, o = e.id === "focus" && i !== null && i < 7 && n ? ` ActiveRings has kept your workouts since ${H(Date.parse(`${n}T12:00:00`), this._language)}, so this counts ${i} ${i === 1 ? "day" : "days"} so far.` : "";
    return u`
      <div class="info ${this._tipAbove ? "above" : ""}" id="ar-tip-${e.id}" role="tooltip">
        <b>${s.title}</b>
        <p>${s.about}${o}</p>
        <p><i>Full</i>${s.scoring} Goals are set under the integration's Configure.</p>
        <p>
          <i>Yours</i>${this._reading(e, t)}${r !== null ? `, ${Math.round(r)} % of the goal` : ""}
        </p>
      </div>
    `;
  }
  _renderSet(e, t) {
    const s = p(this._metric(e.score)), r = s === null ? "" : s >= 100 ? "done" : s >= 60 ? "close" : "", i = [
      70,
      56,
      42
    ], n = e.rings.map((a) => {
      const c = this._metric(a.metric);
      return {
        ring: a,
        data: c,
        score: p(c, "score"),
        percent: p(c, "percent")
      };
    }), o = `${e.label}: ${s === null ? "not available" : `${Math.round(s)} of 100`}. ` + n.map((a) => `${a.ring.label} ${b(a.percent)} % of the goal`).join(", ");
    return u`
      <div class="group">
      <div class="set-head"><b>${e.heading}</b><span>${this._span(e.key)}</span><em>${e.note}</em></div>
      <div class="set">
        <div class="rings ${r ? `b-${r}` : ""}" role="img" aria-label=${o}>
          <svg viewBox="0 0 160 160" aria-hidden="true">
            <defs>
              ${n.map(({ ring: a }) => _e`
                  <linearGradient id="ar-grad-${a.id}" class="c-${a.id}" gradientUnits="userSpaceOnUse"
                    x1="0" y1="0" x2="0" y2="160">
                    <stop offset="0" style="stop-color:currentColor"></stop>
                    <stop offset="1" style="stop-color:var(--end, currentColor)"></stop>
                  </linearGradient>`)}
            </defs>
            ${n.map(({ ring: a, score: c }, g) => {
      const l = i[g], d = 2 * Math.PI * l, f = this._fraction(c);
      return _e`
                <circle class="track c-${a.id}" cx="80" cy="80" r=${l} stroke-width="10"></circle>
                <circle style="stroke:url(#ar-grad-${a.id})" class="fill c-${a.id} ${f <= 0 ? "empty" : ""}"
                  cx="80" cy="80" r=${l} stroke-width="10"
                  stroke-dasharray=${d} stroke-dashoffset=${d * (1 - f)}></circle>`;
    })}
          </svg>
          <div class="center">
            <span class="score">${s === null ? "--" : Math.round(s)}</span>
            <span class="band"><span class="band-dot"></span><span>${e.label}</span></span>
          </div>
        </div>
        ${t ? u`<div class="rows">
              ${n.map(({ ring: a, data: c, score: g, percent: l }) => {
      const d = this._left(a, c);
      return u`
                  <div
                    class="row c-${a.id}"
                    tabindex="0"
                    aria-describedby=${this._tip === a.id ? `ar-tip-${a.id}` : h}
                    @pointerenter=${(f) => this._openTip(a.id, f)}
                    @pointerleave=${() => this._tip = null}
                    @focus=${(f) => this._openTip(a.id, f)}
                    @blur=${() => this._tip = null}
                  >
                    <div class="row-head">
                      <span class="dot"></span>
                      <span class="row-name">${a.label}</span>
                      <span class="row-value"><b>${b(l)}</b>%</span>
                    </div>
                    ${e.key === "week" ? this._renderStrip(a) : u`<div class="bar">
                          <div class="bar-fill" style="width:${this._fraction(g) * 100}%"></div>
                        </div>`}
                    <div class="row-detail">
                      <span>${this._reading(a, c)}</span
                      ><span class=${d.reached ? "reached" : ""}>${d.text}</span>
                    </div>
                    ${this._tip === a.id ? this._renderInfo(a, c) : h}
                  </div>
                `;
    })}
            </div>` : h}
      </div>
      </div>
    `;
  }
  get _sets() {
    const e = this._summary?.focus ?? "strength", t = Object.prototype.hasOwnProperty.call(Te, e) ? Te[e] : we(e);
    return Lt.map((s) => s.key === "week" ? {
      ...s,
      rings: [...s.rings, {
        id: "focus",
        label: t,
        metric: "focus_week"
      }]
    } : s);
  }
  _span(e) {
    const t = this._language, s = this._timeZone;
    if (e === "today") return H(this._now, t, s);
    const r = (i) => {
      const n = {
        day: "numeric",
        month: "short"
      };
      try {
        return new Date(i).toLocaleDateString(t, {
          ...n,
          timeZone: s
        });
      } catch {
        return new Date(i).toLocaleDateString(t, n);
      }
    };
    return `${r(this._now - 6 * C)} \u2013 ${r(this._now)}`;
  }
  _renderStrip(e) {
    const t = this._week("exercise_week").map((o) => Number(o) || 0);
    let s;
    if (e.id === "focus") s = this._week("focus_week").map((o) => ({
      fill: o ? 1 : 0,
      on: o === !0
    }));
    else if (t.length) if (e.id === "days") {
      const o = p(this._metric("active_days_week"), "threshold") ?? 30;
      s = t.map((a) => ({
        fill: o > 0 ? Oe(a / o) : 0,
        on: o > 0 && a >= o
      }));
    } else {
      const o = Math.max(...t, 1);
      s = t.map((a) => ({
        fill: a / o,
        on: a > 0
      }));
    }
    else return h;
    if (s.length !== 7) return h;
    const r = this._language, i = this._timeZone, n = (o) => {
      try {
        return new Date(o).toLocaleDateString(r, {
          weekday: "narrow",
          timeZone: i
        });
      } catch {
        return new Date(o).toLocaleDateString(r, { weekday: "narrow" });
      }
    };
    return u`
      <div class="strip" aria-hidden="true">
        ${s.map((o, a) => {
      const c = this._ready ? Math.round(o.fill * 100) : 0;
      return u`<span class="${o.on ? "on" : ""} ${a === 6 ? "now" : ""}"
            ><i style="--f:${c}%"></i><u>${n(this._now - (6 - a) * C)}</u></span
          >`;
    })}
      </div>
    `;
  }
  _week(e) {
    const t = this._metric(e)?.days;
    return Array.isArray(t) && t.length === 7 ? t : [];
  }
  _seg(e, t, s, r) {
    return u`
      <span class="seg" role="group" aria-label=${e}>
        ${t.map((i) => u`<button
            type="button"
            aria-pressed=${i.value === s ? "true" : "false"}
            @click=${() => r(i.value)}
          >
            ${i.label}
          </button>`)}
      </span>
    `;
  }
  _hoverOf(e) {
    return this._hover?.chart === e ? this._hover.index : null;
  }
  _setHover(e, t) {
    this._hover = t === null ? null : {
      chart: e,
      index: t
    };
  }
  _stat(e, t, s, r = "") {
    return u`
      <div class="stat k-${e}">
        <div class="stat-head"><span class="dot"></span><span class="stat-name">${t}</span></div>
        <div class="stat-value">${s}</div>
        ${r ? u`<div class="stat-note">${r}</div>` : h}
      </div>
    `;
  }
  _monthShort(e) {
    try {
      return new Date(e).toLocaleDateString(this._language, {
        month: "short",
        timeZone: this._timeZone
      });
    } catch {
      return new Date(e).toLocaleDateString(this._language, { month: "short" });
    }
  }
  _monthLong(e) {
    const t = {
      month: "long",
      year: "numeric"
    };
    try {
      return new Date(e).toLocaleDateString(this._language, {
        ...t,
        timeZone: this._timeZone
      });
    } catch {
      return new Date(e).toLocaleDateString(this._language, t);
    }
  }
  _bars(e, t, s) {
    const r = this._series[e];
    if (!r) return null;
    const i = this._language, n = this._timeZone, o = [], a = [];
    let c = "";
    r.forEach((l, d) => {
      const f = l.start + Math.min(C / 2, (l.end - l.start) / 2), _ = E(f, n);
      let v, O = "";
      if (t === "day")
        v = H(f, i, n), (r.length - 1 - d) % 7 === 0 && (O = `${Number(_.slice(8, 10))} ${this._monthShort(f)}`);
      else if (t === "week") {
        v = `Week of ${ye(f, i, n)}`;
        const S = _.slice(0, 7);
        c && S !== c && (O = this._monthShort(f)), c = S;
      } else {
        const S = l.start + (l.end - l.start) / 2;
        v = this._monthLong(S), E(S, n).slice(5, 7) === "01" && (O = E(S, n).slice(0, 4));
      }
      O && a.push(d), o.push({
        value: s ? l.value / l.days : l.value,
        title: s && t !== "day" ? `${v} \xB7 average a day` : v,
        tick: O,
        running: l.end > this._now
      });
    });
    const g = Math.ceil(a.length / Bt);
    return g > 1 && a.forEach((l, d) => {
      (a.length - 1 - d) % g && (o[l].tick = "");
    }), o;
  }
  _renderToday() {
    if (!this._summary) return h;
    const e = this._metric("distance"), t = this._metric("active_energy"), s = this._metric("resting_energy"), r = this._metric("total_energy");
    if ([
      e,
      t,
      s,
      r
    ].every((l) => p(l) === null)) return h;
    const i = this._miles, n = i ? Z : 1, o = i ? "mi" : "km", a = this._energyFactor, c = this._energyUnit, g = (l, d) => {
      const f = p(l, "average_7d");
      return f === null ? "" : `7-day average ${d(f)}`;
    };
    return u`
      <div class="section today">
        <div class="section-head"><span>Today</span></div>
        <div class="stats">
          ${p(e) !== null ? this._stat("distance", "Distance", u`<b>${b(p(e) * n, 1)}</b> ${o}`, g(e, (l) => `${b(l * n, 1)} ${o}`)) : h}
          ${p(t) !== null ? this._stat("energy", "Active energy", u`<b>${this._count(p(t) * a)}</b> ${c}`, g(t, (l) => `${this._count(l * a)}`)) : h}
          ${p(s) !== null ? this._stat("resting", "Resting energy", u`<b>${this._count(p(s) * a)}</b> ${c}`, "What your body uses at rest") : h}
          ${p(r) !== null ? this._stat("total", "Total burn", u`<b>${this._count(p(r) * a)}</b> ${c}`, g(r, (l) => `${this._count(l * a)}`)) : h}
        </div>
      </div>
    `;
  }
  _renderSteps() {
    if (!this._summary) return h;
    const e = this._metric("steps"), t = this._metric("steps_average"), s = this._metric("steps_streak"), r = this._metric("steps_best"), i = Y[this._stepsRange], n = this._bars("steps", i.period, !0);
    if (p(e) === null && !n?.length) return h;
    const o = p(e, "goal") ?? p(t, "goal"), a = p(s), c = p(s, "best"), g = r?.date ? Date.parse(`${String(r.date).slice(0, 10)}T12:00:00`) : NaN, l = p(t, "average_30d");
    return u`
      <div class="section steps">
        <div class="section-head">
          <span>Steps</span>
          ${this._seg("Period of the steps chart", Se.map((d) => ({
      value: d,
      label: Y[d].label
    })), this._stepsRange, (d) => {
      this._stepsRange = d, this._hover = null, this._series = {
        ...this._series,
        steps: void 0
      }, this._loadSeries("steps");
    })}
        </div>
        ${n === null ? u`<div class="chart-empty">${"Loading\u2026"}</div>` : Ae({
      kind: "k-steps",
      bars: n,
      goal: o,
      format: (d) => `${this._count(d)} steps`,
      label: i.period === "day" ? "Steps" : "A day",
      hover: this._hoverOf("steps"),
      onHover: (d) => this._setHover("steps", d),
      description: i.period === "day" ? "Steps on each day" : `Average steps a day in each ${i.period}`
    })}
        ${n?.length && i.period !== "day" ? u`<div class="chart-note">Average steps a day in each ${i.period}</div>` : h}
        <div class="stats" style="margin-top:12px">
          ${p(t) !== null ? this._stat("steps", "7-day average", u`<b>${this._count(p(t))}</b> a day`, l !== null ? `30-day average ${this._count(l)}` : "") : h}
          ${a !== null ? this._stat("streak", "Goal streak", u`<b>${Math.round(a)}</b> ${Math.round(a) === 1 ? "day" : "days"}`, c !== null && c > 0 ? `Longest in a year ${Math.round(c)}` : "") : h}
          ${p(r) !== null ? this._stat("energy", "Best day", u`<b>${this._count(p(r))}</b>`, Number.isFinite(g) ? ye(g, this._language) : "") : h}
        </div>
      </div>
    `;
  }
  _renderExercise() {
    if (!this._summary) return h;
    const e = this._metric("exercise"), t = this._metric("exercise_week"), s = this._bars("exercise", "week", !1);
    if (p(e) === null && !s?.length) return h;
    const r = p(t, "goal"), i = p(e, "average_7d");
    return u`
      <div class="section exercise">
        <div class="section-head">
          <span>Exercise each week</span>
          ${this._seg("Period of the exercise chart", Ee.map((n) => ({
      value: n,
      label: Re[n].label
    })), this._exerciseRange, (n) => {
      this._exerciseRange = n, this._hover = null, this._series = {
        ...this._series,
        exercise: void 0
      }, this._loadSeries("exercise");
    })}
        </div>
        ${s === null ? u`<div class="chart-empty">${"Loading\u2026"}</div>` : Ae({
      kind: "k-exercise",
      bars: s,
      goal: r,
      format: (n) => `${this._count(n)} min`,
      label: "Exercise",
      hover: this._hoverOf("exercise"),
      onHover: (n) => this._setHover("exercise", n),
      description: "Exercise minutes in each week"
    })}
        <div class="stats" style="margin-top:12px">
          ${p(t) !== null ? this._stat("minutes", "Last 7 days", u`<b>${this._count(p(t))}</b> min`, r !== null ? `Goal ${this._count(r)} min` : "") : h}
          ${p(e) !== null ? this._stat("exercise", "Today", u`<b>${this._count(p(e))}</b> min`, i !== null ? `7-day average ${this._count(i)} min` : "") : h}
        </div>
      </div>
    `;
  }
  _when(e) {
    const t = this._language, s = this._timeZone, r = E(e, s);
    return r === E(this._now, s) ? `Today ${me(e, t, s)}` : r === E(this._now - C, s) ? `Yesterday ${me(e, t, s)}` : xe(e, t, s);
  }
  _workoutDetail(e) {
    const t = [], s = this._miles, r = m(e.distance_km);
    if (r !== null && r >= 0.05) {
      t.push(`${b(r * (s ? Z : 1), 1)} ${s ? "mi" : "km"}`);
      const o = m(e.pace_min_per_km);
      o !== null && o > 0 && t.push(`${At(s ? o / Z : o)} /${s ? "mi" : "km"}`);
    }
    const i = m(e.active_calories) ?? m(e.total_calories);
    i !== null && i > 0 && t.push(`${this._count(i * this._energyFactor)} ${this._energyUnit}`);
    const n = m(e.heart_rate_avg);
    if (n !== null) {
      const o = m(e.heart_rate_max);
      t.push(`${b(n)} bpm${o !== null ? ` (max ${b(o)})` : ""}`);
    }
    return t.join(" \xB7 ");
  }
  _renderWorkouts() {
    const e = this._summary;
    if (!e) return h;
    const t = this._metric("workouts_week"), s = Math.min(Me, Math.max(1, Math.round(m(this._config?.workouts_shown) ?? 5))), r = e.workouts.filter((g) => g && typeof g == "object" && typeof g.type == "string" && Number.isFinite(Date.parse(String(g.start)))).slice(0, s);
    if (!r.length && !t && !e.workouts_since) return h;
    const i = p(t, "days_known"), n = e.workouts_since ? Date.parse(`${e.workouts_since.slice(0, 10)}T12:00:00`) : NaN, o = p(t), a = p(t, "minutes"), c = o !== null ? `Last 7 days: ${Math.round(o)} ${Math.round(o) === 1 ? "workout" : "workouts"}` + (a !== null && o > 0 ? ` \xB7 ${$e(a)}` : "") + (i !== null && i < 7 && Number.isFinite(n) ? ` \xB7 counting since ${H(n, this._language)}` : "") : "";
    return u`
      <div class="section workouts">
        <div class="section-head"><span>Workouts</span></div>
        ${r.length ? u`<ul class="workouts-list">
              ${r.map((g) => {
      const l = m(g.minutes), d = this._workoutDetail(g);
      return u`<li class="workout k-${g.focus === !0 ? "focus" : "cardio"}">
                  <span class="dot"></span>
                  <span class="workout-name"
                    >${we(g.type)}
                    ${l !== null ? u`<small>${` \xB7 ${$e(l)}`}</small>` : h}</span
                  >
                  <span class="workout-when">${this._when(Date.parse(g.start))}</span>
                  ${d ? u`<span class="workout-detail">${d}</span>` : h}
                </li>`;
    })}
            </ul>` : u`<div class="empty-note">No workouts yet. They appear here after the next sync.</div>`}
        ${c ? u`<div class="workouts-foot">${c}</div>` : h}
      </div>
    `;
  }
};
ne = Ke;
ne.styles = zt;
ne.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 },
  _summary: { state: !0 },
  _series: { state: !0 },
  _stepsRange: { state: !0 },
  _exerciseRange: { state: !0 },
  _hover: { state: !0 },
  _tip: { state: !0 },
  _tipAbove: { state: !0 },
  _error: { state: !0 },
  _now: { state: !0 },
  _ready: { state: !0 }
};
customElements.get(I) || customElements.define(I, Ke);
window.customCards = window.customCards ?? [];
window.customCards.some((e) => e.type === I) || window.customCards.push({
  type: I,
  name: "Active Rings",
  description: "Two sets of rings filled against your goals (today, and the last 7 days), steps and exercise charts and your recent workouts.",
  preview: !0
});
console.info(`%c ACTIVE-RINGS-CARD %c ${Ht} `, "background:#d61fb6;color:#fff", "");
export {
  Ke as ActiveRingsCard,
  Ht as CARD_VERSION
};
