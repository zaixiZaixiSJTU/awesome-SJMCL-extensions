(function registerClockExtension(factory) {
  var token = document.currentScript?.dataset?.extensionToken || "";

  if (!token) {
    throw new Error("Missing extension activation token");
  }

  window.registerExtension(factory, token);
})(function (api) {
  var React = api.React;
  var Badge = api.ChakraUI.Badge;
  var Divider = api.ChakraUI.Divider;
  var HStack = api.ChakraUI.HStack;
  var Text = api.ChakraUI.Text;
  var VStack = api.ChakraUI.VStack;

  function pickRandomLevel() {
    var levels = ["info", "warn", "error", "debug", "trace"];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  function writeRandomLog(logger) {
    var level = pickRandomLevel();
    var log = logger[level];

    if (typeof log === "function") {
      log("[org.sjmcl.clock] tick at", new Date().toISOString(), "level=", level);
    }
  }

  var PanelComponent = function ClockPanel() {
    var host = api.getHostContext();
    var useExtensionState = host.state.useExtensionState;
    var actions = host.actions;
    var stateTuple = useExtensionState("now", Date.now());
    var now = stateTuple[0];
    var setNow = stateTuple[1];

    React.useEffect(function setupTicker() {
      var timer = window.setInterval(function () {
        setNow(Date.now());
      }, 1000);
      return function cleanup() {
        window.clearInterval(timer);
      };
    }, [setNow]);

    React.useEffect(function setupLoggerTicker() {
      writeRandomLog(actions.logger);
      var timer = window.setInterval(function () {
        writeRandomLog(actions.logger);
      }, 60 * 1000);
      return function cleanup() {
        window.clearInterval(timer);
      };
    }, [actions.logger]);

    var date = new Date(now);
    var timeText = date.toLocaleTimeString("zh-CN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    var dateText = date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });

    return React.createElement(
      VStack,
      { align: "stretch", spacing: 3 },
      React.createElement(
        HStack,
        { justify: "space-between", align: "center" },
        React.createElement(
          Text,
          { fontSize: "sm", fontWeight: "bold" },
          "Local Clock"
        ),
        React.createElement(
          Badge,
          { colorScheme: "cyan", variant: "subtle" },
          Intl.DateTimeFormat().resolvedOptions().timeZone
        )
      ),
      React.createElement(
        Text,
        { fontSize: "4xl", fontWeight: "black", lineHeight: 1 },
        timeText
      ),
      React.createElement(
        Text,
        { fontSize: "sm", className: "secondary-text" },
        dateText
      ),
      React.createElement(Divider, null),
      React.createElement(
        Text,
        { fontSize: "xs", className: "secondary-text" },
        "This plugin uses frontend timer updates and logger output."
      )
    );
  };

  return {
    homeWidget: {
      title: "Clock",
      defaultWidth: 300,
      minWidth: 260,
      Component: PanelComponent,
    },
  };
});
