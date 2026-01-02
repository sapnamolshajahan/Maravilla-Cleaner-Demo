from datetime import date

from odoo import models,fields,api
from odoo.odoo.exceptions import ValidationError


class SaleOrder(models.Model):

    _inherit = 'sale.order'
    _description = 'Sale order inherit'

    room_number = fields.Char(string="Room Number")
    room_type = fields.Char(string="Room Type")
    check_in = fields.Date(string="Check In")
    check_out = fields.Date(string="Check Out")
    num_person = fields.Integer(string="Number of Persons")
    remarks = fields.Text(string="Remarks")

    @api.constrains('check_in', 'check_out')
    def _check_dates(self):
        today = date.today()
        for record in self:
            if record.check_in and record.check_in < today:
                raise ValidationError("Check-in date cannot be in the past.")
            if record.check_out and record.check_out < today:
                raise ValidationError("Check-out date cannot be in the past.")
            if record.check_in and record.check_out and record.check_out < record.check_in:
                raise ValidationError("Check-out date cannot be before Check-in date.")

    def action_confirm(self):
        res = super().action_confirm()

        for order in self:
            print(f"SO: {order.name}, Check-in: {order.check_in}, Check-out: {order.check_out}")

            fsm_tasks = self.env['project.task'].search([
                ('sale_order_id', '=', order.id),
                ('is_fsm', '=', True),
            ])

            # Apply mapping and save to database
            if fsm_tasks:
                fsm_tasks.write({
                    'planned_date_begin': order.check_in,
                    'date_deadline': order.check_out,
                    'room_number':order.room_number,
                    'room_type':order.room_type,
                    'num_person':order.num_person,
                    'remarks':order.remarks,

                })

        return res