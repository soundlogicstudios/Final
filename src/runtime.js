
window.Runtime = (function () {
  const storyPath = "content/packs/starter/stories/world_of_lorecraft.json";
  const container = () => document.querySelector("#screen-story .story-text");
  let story = null;
  let current = null;
  let state = { hp: 15, xp: 0, flags: {}, inventory: {} };

  async function loadStory() {
    const res = await fetch(storyPath, { cache: "no-store" });
    story = await res.json();
    console.log("[Runtime] Story loaded:", story.title);
    return story;
  }

  function start() {
    renderSection(story.start);
  }

  function renderSection(id) {
    const section = story.sections.find(s => s.id === id);
    if (!section) return console.warn("Missing section:", id);
    current = id;
    const el = container();
    el.innerHTML = "";

    const para = document.createElement("div");
    para.className = "section-text";
    para.innerHTML = `<p>${section.text.replace(/\n\n/g, "</p><p>")}</p>`;
    el.appendChild(para);

    if (section.system) {
      const sys = document.createElement("div");
      sys.className = "system-text";
      sys.textContent = section.system;
      el.appendChild(sys);
    }

    if (section.choices?.length) {
      const choiceWrap = document.createElement("div");
      choiceWrap.className = "choices";
      section.choices.forEach(c => {
        const btn = document.createElement("button");
        btn.textContent = c.label;
        btn.className = "choice-btn";
        btn.addEventListener("click", () => choose(c));
        choiceWrap.appendChild(btn);
      });
      el.appendChild(choiceWrap);
    }
    el.scrollTop = el.scrollHeight;
  }

  function choose(choice) {
    if (choice.effects) applyEffects(choice.effects);
    if (choice.toMenu) {
      window.Router?.go?.("menu");
      return;
    }
    renderSection(choice.to);
  }

  function applyEffects(effects) {
    const list = Array.isArray(effects) ? effects : [effects];
    list.forEach(eff => {
      if (eff.hp) state.hp += eff.hp;
      if (eff.xp) state.xp += eff.xp;
      if (eff.setFlag) state.flags[eff.setFlag] = true;
      if (eff.addItem) {
        const { category, id } = eff.addItem;
        state.inventory[`${category}:${id}`] = eff.addItem;
      }
      if (eff.removeItem) {
        const key = `${eff.removeItem.category}:${eff.removeItem.id}`;
        delete state.inventory[key];
      }
    });
    console.log("[Runtime] State updated:", state);
  }

  return { loadStory, start, renderSection, choose, applyEffects, state };
})();
