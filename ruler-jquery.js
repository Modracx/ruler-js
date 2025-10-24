/*!
 * jQuery ruler
 * Kenneth D'silva (Modracx), Copyright (c) October 2025
 * Licensed under the MIT License – https://opensource.org/licenses/MIT
 */
(function ($) {
  function pixelsPerInch() {
    const $div = $("<div>").css({
      width: "1in",
      position: "absolute",
      visibility: "hidden",
    });
    $("body").append($div);
    const ppi = $div[0].offsetWidth;
    $div.remove();
    return ppi;
  }

  function pixelsPerUnit(unit = "px") {
    const ppi = pixelsPerInch();
    switch (unit) {
      case "in":
        return ppi;
      case "cm":
        return ppi / 2.54;
      case "mm":
        return ppi / 25.4;
      case "px":
      default:
        return 1;
    }
  }

  function unitToPixels(value, unit) {
    return value * pixelsPerUnit(unit);
  }

  function pixelsToUnits(px, unit) {
    return px / pixelsPerUnit(unit);
  }

  function createRuler($container, options = {}) {
    if ($container.data("__rulerCleanup")) {
      $container.data("__rulerCleanup")();
      $container.removeData("__rulerCleanup");
    }

    const defaults = {
      vRuleSize: 18,
      hRuleSize: 18,
      showCrosshair: true,
      showMousePos: true,
      tickColor: "#323232",
      crosshairColor: "#000",
      crosshairStyle: "dotted",
      mouseBoxBg: "#323232",
      mouseBoxColor: "#fff",
      unit: "in",
      unitPrecision: 1,
    };

    const settings = $.extend({}, defaults, options);
    const pxPerUnit = pixelsPerUnit(settings.unit);
    const $hRule = $("<div>").css({
      position: "absolute",
      background: "#e5e5e5",
      height: settings.hRuleSize + "px",
      width: "100%",
      top: 0,
      left: 0,
      borderBottom: "1px solid #ccc",
      zIndex: 9,
      fontSize: "12px",
      color: "#323232",
      overflow: "hidden",
      pointerEvents: "none",
      lineHeight: "14px",
      userSelect: "none",
    });

    const $vRule = $("<div>").css({
      position: "absolute",
      background: "#e5e5e5",
      width: settings.vRuleSize + "px",
      height: "100%",
      top: 0,
      left: 0,
      borderRight: "1px solid #ccc",
      zIndex: 9,
      fontSize: "12px",
      color: "#323232",
      overflow: "hidden",
      pointerEvents: "none",
      lineHeight: "14px",
      userSelect: "none",
    });

    const $corner = $("<div>").css({
      position: "absolute",
      width: settings.vRuleSize + "px",
      height: settings.hRuleSize + "px",
      background: "#e5e5e5",
      top: 0,
      left: 0,
      borderRight: "1px solid #ccc",
      borderBottom: "1px solid #ccc",
      zIndex: 10,
    });

    $container.append($hRule, $vRule, $corner);

    let $vMouse, $hMouse, $mousePosBox;

    if (settings.showCrosshair) {
      $vMouse = $("<div>").css({
        position: "absolute",
        width: "100%",
        height: "0px",
        left: 0,
        borderBottom: `1px ${settings.crosshairStyle} ${settings.crosshairColor}`,
        zIndex: 11,
        pointerEvents: "none",
      });
      $hMouse = $("<div>").css({
        position: "absolute",
        height: "100%",
        width: "0px",
        top: 0,
        borderLeft: `1px ${settings.crosshairStyle} ${settings.crosshairColor}`,
        zIndex: 11,
        pointerEvents: "none",
      });
      $container.append($vMouse, $hMouse);
    }

    if (settings.showMousePos) {
      $mousePosBox = $("<div>").css({
        position: "absolute",
        fontSize: "12px",
        background: settings.mouseBoxBg,
        color: settings.mouseBoxColor,
        whiteSpace: "nowrap",
        zIndex: 12,
        pointerEvents: "none",
        padding: "3px 10px",
        borderRadius: "5px",
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.4)",
      });
      $container.append($mousePosBox);
    }

    function getTickType(unitValue) {
      const u = settings.unit;
      if (u === "in" || u === "cm") {
        const frac = unitValue % 1;
        if (Math.abs(frac) < 0.001) return "major";
        if (Math.abs(frac - 0.5) < 0.001) return "medium";
        return "small";
      } else if (u === "px") {
        const mod = unitValue % 100;
        if (mod === 0) return "major";
        if (mod === 50) return "medium";
        return "small";
      }
      return "small";
    }

    function renderTicks() {
      $hRule.empty();
      $vRule.empty();
      $vRule.css("height", $container.outerHeight() + "px");

      const hMax = $hRule.outerWidth();
      const totalHUnits = pixelsToUnits(
        hMax - settings.vRuleSize,
        settings.unit
      );
      const step = settings.unit === "px" ? 10 : 0.1;

      for (let i = 0; i <= totalHUnits / step; i++) {
        const unitValue = i * step;
        const tickType = getTickType(unitValue);
        const tickPx =
          settings.vRuleSize + unitToPixels(unitValue, settings.unit);

        const tickHeight =
          tickType === "small" ? "4px" : tickType === "medium" ? "6px" : "100%";

        const $tick = $("<div>").css({
          position: "absolute",
          bottom: 0,
          left: tickPx + "px",
          width: "1px",
          background: settings.tickColor,
          height: tickHeight,
        });

        if (tickType === "major") {
          const $label = $("<div>")
            .css({
              position: "absolute",
              bottom: "16px",
              left: "12px",
              fontSize: "10px",
              color: settings.tickColor,
              transform: "translate(-50%, 100%)",
              whiteSpace: "nowrap",
            })
            .text(
              unitValue.toFixed(settings.unitPrecision) + " " + settings.unit
            );
          $tick.append($label);
        }

        $hRule.append($tick);
      }

      const vMax = $vRule.outerHeight();
      const totalVUnits = pixelsToUnits(
        vMax - settings.hRuleSize,
        settings.unit
      );

      for (let i = 0; i <= totalVUnits / step; i++) {
        const unitValue = i * step;
        const tickType = getTickType(unitValue);
        const tickPx =
          settings.hRuleSize + unitToPixels(unitValue, settings.unit);

        const tickWidth =
          tickType === "small" ? "4px" : tickType === "medium" ? "6px" : "100%";

        const $tick = $("<div>").css({
          position: "absolute",
          top: tickPx + "px",
          right: 0,
          height: "1px",
          background: settings.tickColor,
          width: tickWidth,
        });

        if (tickType === "major") {
          const $label = $("<span>")
            .css({
              display: "block",
              position: "absolute",
              top: "2px",
              right: 0,
              transform: "rotate(-90deg)",
              transformOrigin: "top right",
              marginRight: settings.vRuleSize + "px",
              color: settings.tickColor,
              fontSize: "10px",
            })
            .text(
              unitValue.toFixed(settings.unitPrecision) + " " + settings.unit
            );
          $tick.append($label);
        }

        $vRule.append($tick);
      }
    }

    function onMouseMove(e) {
      const rect = $container[0].getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (settings.showCrosshair) {
        $vMouse && $vMouse.css("top", y + "px");
        $hMouse && $hMouse.css("left", x + "px");
      }

      if (settings.showMousePos) {
        const xVal = pixelsToUnits(
          x - settings.vRuleSize,
          settings.unit
        ).toFixed(settings.unitPrecision);
        const yVal = pixelsToUnits(
          y - settings.hRuleSize,
          settings.unit
        ).toFixed(settings.unitPrecision);
        $mousePosBox.html(
          `x: ${xVal} ${settings.unit}<br>y: ${yVal} ${settings.unit}`
        );
        $mousePosBox.css({ top: y + 16 + "px", left: x + 12 + "px" });
      }
    }

    renderTicks();
    $(window).on("resize.ruler", renderTicks);
    $container.on("mousemove.ruler", onMouseMove);

    const cleanup = function () {
      $hRule.remove();
      $vRule.remove();
      $corner.remove();
      $vMouse && $vMouse.remove();
      $hMouse && $hMouse.remove();
      $mousePosBox && $mousePosBox.remove();
      $container.off(".ruler");
      $(window).off(".ruler");
    };

    $container.data("__rulerCleanup", cleanup);
  }

  function clearRuler($container) {
    if ($container.data("__rulerCleanup")) {
      $container.data("__rulerCleanup")();
      $container.removeData("__rulerCleanup");
    }
  }

  $.fn.Ruler = function (method, options) {
    return this.each(function () {
      const $this = $(this);
      if (method === "create") {
        createRuler($this, options);
      } else if (method === "clear") {
        clearRuler($this);
      }
    });
  };
})(jQuery);
