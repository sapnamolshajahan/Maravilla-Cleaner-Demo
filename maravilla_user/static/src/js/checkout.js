/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.CheckoutValidation = publicWidget.Widget.extend({
    selector: "#wrap",

    events: {
        "click a[name='website_sale_main_button']": "_onConfirmClickValidated",
        "change input[name='check_in'], change input[name='check_out'], change input[name='room_number']":
            "_clearError",
    },

    _clearError() {
        const $box = $("#checkout_error_box");
        if ($box.length) {
            $box.addClass("d-none").text("");
        }
    },

    _showError(message) {
        let $box = $("#checkout_error_box");
        if (!$box.length) {
            $("#wrap").prepend(
                `<div id="checkout_error_box" class="alert alert-danger mt-3" role="alert">
                    ${message}
                </div>`
            );
        } else {
            $box.text(message).removeClass("d-none");
        }

        $("html, body").animate(
            { scrollTop: $("#checkout_error_box").offset().top - 100 },
            300
        );
    },

    _parseDate(value) {
        if (!value) return null;
        return new Date(value); // yyyy-mm-dd (HTML date input)
    },

    async _onConfirmClickValidated(ev) {
        console.log("WOWWWWWWWWWWWWWWWWWWWWWWWWW");
        if (window.location.pathname !== "/shop/address") {
            return this._super(ev);
        }

        if (!$("input[name='check_in']").length) {
            return this._super(ev);
        }
        if (this._validating) return;

        this._validating = true;
        ev.preventDefault();

        const button = $(ev.currentTarget);
        button.prop("disabled", true);

        try {
            const roomNumber = $("input[name='room_number']").val();
            const checkInVal = $("input[name='check_in']").val();
            const checkOutVal = $("input[name='check_out']").val();

            // -------------------------
            // ROOM NUMBER VALIDATION
            // -------------------------
            if (roomNumber && !/^[A-Za-z0-9]+$/.test(roomNumber)) {
                this._showError(
                    "Please check the Room Number. Special characters are not allowed."
                );
                button.prop("disabled", false);
                this._validating = false;
                return;
            }

            // -------------------------
            // DATE VALIDATION
            // -------------------------
            if (checkInVal && checkOutVal) {
                const checkIn = this._parseDate(checkInVal);
                const checkOut = this._parseDate(checkOutVal);

                if (checkOut < checkIn) {
                    this._showError(
                        "Check-out date cannot be before Check-in date."
                    );
                    button.prop("disabled", false);
                    this._validating = false;
                    return;
                }
            }

            // ✅ ALL GOOD → PROCEED
            button.prop("disabled", false);
            this._validating = false;

            // Trigger original click
            button.off("click");
            button[0].click();

        } catch (err) {
            console.error("Checkout validation error:", err);
            this._showError("Something went wrong while validating your details.");
            button.prop("disabled", false);
            this._validating = false;
        }
    },
});
