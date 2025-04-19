const std = @import("std");
const zap = @import("zap");
const Runner = @import("../runner.zig");
const Constants = @import("../constants.zig");
pub const Netron = @This();

allocator: std.mem.Allocator = undefined,
path: []const u8,
error_strategy: zap.Endpoint.ErrorStrategy = .log_to_response,

pub fn init(
    allocator: std.mem.Allocator,
    path: []const u8,
) Netron {
    return .{
        .allocator = allocator,
        .path = path,
    };
}

pub fn deinit(_: *Netron) void {}

pub fn put(_: *Netron, _: zap.Request) !void {}
pub fn get(self: *Netron, r: zap.Request) !void {
    try r.parseBody();
    const params = try r.parametersToOwnedList(self.allocator);
    defer params.deinit();

    var _model: ?[]const u8 = null;
    var _id: ?[]const u8 = null;
    var builtin: bool = false;

    for (params.items) |param| {
        if (std.mem.eql(u8, param.key, "id")) {
            if (param.value) |value| {
                _id = value.String;
            }
        }
        if (std.mem.eql(u8, param.key, "model")) {
            if (param.value) |value| {
                _model = value.String;
            }
        }
        if (std.mem.eql(u8, param.key, "builtin")) {
            if (param.value) |value| {
                builtin = value.Bool;
            }
        }
    }

    if (_id == null) {
        return r.sendBody("User ID not found\n");
    }

    if (_model == null) {
        return r.sendBody("Model not found\n");
    }

    const id = _id.?;
    const model = _model.?;

    const model_path = if (builtin)
        try std.fmt.allocPrint(self.allocator, "vendor/Z-Ant/datasets/models/{s}/{s}.onnx", .{
            model,
            model,
        })
    else
        try std.fmt.allocPrint(self.allocator, "{s}/{s}/models/{s}.onnx", .{
            Constants.DATABASE_PATH,
            id,
            model,
        });

    defer self.allocator.free(model_path);

    const netron_output_path = try std.fmt.allocPrint(self.allocator, "{s}/{s}/netron", .{
        Constants.DATABASE_PATH,
        id,
    });

    defer self.allocator.free(netron_output_path);

    try std.fs.cwd().makePath(netron_output_path);

    const netron_output_file_path = try std.fmt.allocPrint(self.allocator, "{s}/{s}.svg", .{
        netron_output_path,
        model,
    });

    defer self.allocator.free(netron_output_file_path);

    try Runner.runNetron(
        self.allocator,
        netron_output_file_path,
        model_path,
    );

    const file = try std.fs.cwd().openFile(netron_output_file_path, .{});
    defer file.close();
    const file_size = try file.getEndPos();
    const file_data = try file.readToEndAlloc(self.allocator, file_size);
    defer self.allocator.free(file_data);

    try r.setHeader("Content-Type", "application/file");
    try r.setHeader("Content-Disposition", try std.fmt.allocPrint(self.allocator, "attachment; filename=\"{s}.svg\"", .{model}));
    try r.setHeader("Access-Control-Allow-Origin", Constants.WEBSITE_URL);
    try r.sendBody(file_data);
}

pub fn patch(_: *Netron, _: zap.Request) !void {}
pub fn delete(_: *Netron, _: zap.Request) !void {}
pub fn post(_: *Netron, _: zap.Request) !void {}

pub fn options(_: *Netron, r: zap.Request) !void {
    try r.setHeader("Access-Control-Allow-Origin", Constants.WEBSITE_URL);
    try r.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    r.setStatus(zap.http.StatusCode.no_content);
    r.markAsFinished(true);
}
