import json

from browser import webcomponent, document, console


# issue 1893
class BaseComponent:
    _initialized: bool = False


class UIPlugin:
    @property
    def prefix(self):
        return self._prefix


class TestComponent(UIPlugin, BaseComponent):
    pass


webcomponent.define("ui-test1893", TestComponent)

# issue 1894
class BaseComponent:
    _initialized: bool = False


class UIPlugin:
    def connectedCallback(self):
        try:
            i_dont_exist
            raise Exception('should have raised NameError')
        except NameError:
            pass


class TestComponent(UIPlugin, BaseComponent):
    pass


webcomponent.define("ui-test", TestComponent)

# issue 2062
class BaseElement:
    _initialized: bool = False


class App(BaseElement):

    def connectedCallback(self):
        if not self._initialized:
            self._get_childs()
            self._initialized = True

    def _get_childs(self):
        main_view_elements = []
        for child in self.children:
            main_view_elements.append(child)
        self._main_view_elements = main_view_elements


webcomponent.define("ui-app", App)

# issue 2075
class BaseComponent:
    _initialized: bool = False


class Config(BaseComponent):

    _prefix = "cnf"

    def connectedCallback(self):
        if not self._initialized:
            self.style.display = "none"
            self._initialized = True
        parent = self.parentNode
        child_config = json.loads(self.text)
        selector = self.attrs.get("selector", None)
        assert hasattr(parent, "select")
        if selector:
            for child in parent.select(selector):
                if child.tagName == "UI-CONFIG":
                    continue
                for attr_name, value in child_config.items():
                    setattr(child, attr_name, value)


class Group(BaseComponent):

    _prefix = "grp"

    def connectedCallback(self):
        assert hasattr(self, "select")
        assert hasattr(self, "bind")

        child_config = json.loads(self.attrs.get("child-config", "{}"))
        group_selector = self.attrs.get("selector", None)
        target_selector = self.attrs.get("target", None)

        if target_selector:
            target = self.closest(target_selector)
        else:
            target = self

        if group_selector:
            children = target.querySelectorAll(group_selector)
        else:
            children = target.children
        for child in children:
            for attr_name, value in child_config.items():
                child.attrs[attr_name] = value


webcomponent.define("ui-group", Group)
webcomponent.define("ui-config", Config)

# issue 2082
class2082 = []
class BaseComponent:
    def _test1(self):
        class2082.append("BaseComponent")


class DemoComponent(BaseComponent):
    def _test1(self):
        class2082.append("DemoComponent")

    def connectedCallback(self):
        self._test1()


webcomponent.define("demo-component2082", DemoComponent)
assert class2082 == ['DemoComponent']

# issue 2169
t2169 = []

def un_camel2169(word: str) -> str:
    upper_chars: str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    last_char: str = word[0]
    output: list = [last_char.lower()]
    for c in word[1:]:
        if c in upper_chars:
            if last_char not in upper_chars:
                output.append('-')
            output.append(c.lower())
        else:
            output.append(c)
        last_char = c
    return "".join(output)


class UIPLugin2169:
    @classmethod
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        tag_name = "ui-" + un_camel2169(cls.__name__)
        webcomponent.define(tag_name, cls)

class SBaseComponent2169:
    _initialized: bool = False
    def connectedCallback(self):
        pass


class BaseComponent2169(SBaseComponent2169):
    def connectedCallback(self):
        if not self._initialized:
            super().connectedCallback()
            if hasattr(self, "__bind_events__"):
                self.__bind_events__()
            self._initialized = True


class DemoComponent2169(UIPLugin2169, BaseComponent2169):
    def connectedCallback(self):
        if not self._initialized:
            t2169.append('init2169')
            s = super()
            s.connectedCallback()
            BaseComponent2169.connectedCallback(self)


demo_comp = DemoComponent2169()
assert t2169 == ['init2169']

# issue 2181
ann = []

class DemoComponent2181:

    x: str

    def get_annotations(self):
        cls = self.__class__
        annotations = {}

        bases = cls.__bases__ + (cls, )
        for base in bases:
            if hasattr(base, "__annotations__"):
                annotations.update(base.__annotations__)
        return annotations

    def connectedCallback(self):
        annotations = self.get_annotations()
        for property_name, property_type in annotations.items():
            ann.append((property_name, property_type))


webcomponent.define("demo-component2181", DemoComponent2181)
assert ann == [('x', str)], ann

# PR 2295
from browser import html

class MyDivA2295(html.DIV):
    def __init__(self):
        self <= "A"

class MyDivB2295(MyDivA2295):
    def __init__(self):
        self <= "B"

class MyDivC2295:
    def __init__(self):
        pass

webcomponent.define("my-div_a_2295", MyDivA2295)

webcomponent.define("my-div_b_2295", MyDivB2295)

webcomponent.define("my-div_c_2295", MyDivC2295)

# issue 2447
class BaseComponent2447:

    _registry = []
    _initialized = False
    _logic_obj = None
    _is_container: bool = False

    @staticmethod
    def un_camel(word: str) -> str:
        upper_chars: str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        last_char: str = word[0]
        output: list = [last_char.lower()]
        for c in word[1:]:
            if c == "_":
                output.append("-")
                continue
            if c in upper_chars:
                if last_char not in upper_chars:
                    output.append('-')
                output.append(c.lower())
            else:
                output.append(c)
            last_char = c
        return "".join(output)

    @classmethod
    def __init_subclass__(cls, **kwargs):
        BaseComponent2447._registry.append(cls)

    @classmethod
    def remove_from_registry(cls, component):
        print(cls._registry, component)
        if component in cls._registry:
            cls._registry.remove(component)

    @classmethod
    def register(cls):
        registry = cls._registry
        for web_component in registry:
            web_component_name = cls.un_camel(web_component.__name__)
            component_name = f"ui-{web_component_name}"
            webcomponent.define(component_name, web_component)

    def add_class(self, class_name):
        classes = self.className.split()
        if class_name not in classes:
            classes.append(class_name)
        self.className = " ".join(classes)

    def add_classes(self, *classes):
        for class_name in classes:
            self.add_class(class_name)


class Icon(BaseComponent2447):

    def connectedCallback(self):
        if not self._initialized:
            self.add_classes("icon", "f7-icons")
            self._initialized = True

    def set_icon(self, icon):
        #self.text = icon
        self.innerText = icon

    @property
    def icon(self):
        return self.innerText

    @icon.setter
    def icon(self, value):
        self.innerText = value


BaseComponent2447.register()

icon = document.getElementById("icon")
assert icon.className == "demo icon f7-icons"
icon.className = "TEST"
assert icon.className == "TEST"

# issue 2454
class BaseComponent2454:

    _registry = []
    _initialized = False
    _logic_obj = None
    _is_container: bool = False
    _observed_attributes: list = ['abcd']

    @property
    def observedAttributes(self):
        return self._observed_attributes

    def attributeChangedCallback(self, name, old, new, ns):
        print(f"attribute {name} changed from {old} to {new}")

    @staticmethod
    def un_camel(word: str) -> str:
        upper_chars: str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        last_char: str = word[0]
        output: list = [last_char.lower()]
        for c in word[1:]:
            if c == "_":
                output.append("-")
                continue
            if c in upper_chars:
                if last_char not in upper_chars:
                    output.append('-')
                output.append(c.lower())
            else:
                output.append(c)
            last_char = c
        return "".join(output)

    @classmethod
    def __init_subclass__(cls, **kwargs):
        BaseComponent2454._registry.append(cls)

    @classmethod
    def remove_from_registry(cls, component):
        print(cls._registry, component)
        if component in cls._registry:
            cls._registry.remove(component)

    @classmethod
    def register(cls):
        registry = cls._registry
        for web_component in registry:
            web_component_name = cls.un_camel(web_component.__name__)
            component_name = f"ui-{web_component_name}"
            console.debug(f"registering web component {web_component} as {component_name}...")
            webcomponent.define(component_name, web_component)

    def add_class(self, class_name):
        classes = self.className.split()
        if class_name not in classes:
            classes.append(class_name)
        self.className = " ".join(classes)

    def add_classes(self, *classes):
        for class_name in classes:
            self.add_class(class_name)


class Icon2454(BaseComponent2454):

    def connectedCallback(self):
        if not self._initialized:
            console.debug("calling add_classes...")
            self.add_classes("icon", "f7-icons")
            self._initialized = True

    def set_icon(self, icon):
        #self.text = icon
        self.innerText = icon

    @property
    def icon(self):
        return self.innerText

    @icon.setter
    def icon(self, value):
        self.innerText = value


BaseComponent2454.register()

print('all tests passed...')