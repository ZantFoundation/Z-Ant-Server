const std = @import("std");
const zap = @import("zap");
const Runner = @import("../runner.zig");
const Constants = @import("../constants.zig");
pub const Libgen = @This();

allocator: std.mem.Allocator = undefined,
path: []const u8,
error_strategy: zap.Endpoint.ErrorStrategy = .log_to_response,

pub fn init(
    allocator: std.mem.Allocator,
    path: []const u8,
) Libgen {
    return .{
        .allocator = allocator,
        .path = path,
    };
}

pub fn deinit(_: *Libgen) void {}

pub fn put(_: *Libgen, _: zap.Request) !void {}
pub fn get(self: *Libgen, r: zap.Request) !void {
    try r.parseBody();
    const params = try r.parametersToOwnedList(self.allocator);
    defer params.deinit();

    var _id: ?[]const u8 = null;
    var _model: ?[]const u8 = null;
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
    }

    if (_id == null) {
        return r.sendBody("User ID not found\n");
    }

    if (_model == null) {
        return r.sendBody("File name not found\n");
    }

    const id = _id.?; // Unwrap the optional ID
    const model = _model.?; // Unwrap the optional file name

    const lib_path = try std.fmt.allocPrint(self.allocator, "{s}/{s}/lib/{s}/libzant.a", .{
        Constants.DATABASE_PATH,
        id,
        model,
    });
    defer self.allocator.free(lib_path);
    const file = try std.fs.cwd().openFile(lib_path, .{});
    defer file.close();
    const file_size = try file.getEndPos();
    const file_data = try file.readToEndAlloc(self.allocator, file_size);
    defer self.allocator.free(file_data);
    try r.setHeader("Content-Type", "application/file");
    try r.setHeader("Content-Disposition", try std.fmt.allocPrint(self.allocator, "attachment; filename=\"{s}.a\"", .{model}));
    try r.setHeader("Access-Control-Allow-Origin", Constants.WEBSITE_URL);
    try r.sendBody(file_data);
}

pub fn patch(_: *Libgen, _: zap.Request) !void {}
pub fn delete(_: *Libgen, _: zap.Request) !void {}

pub fn post(self: *Libgen, r: zap.Request) !void {
    //try self.options(r);
    try r.parseBody();
    r.parseQuery();

    const params = try r.parametersToOwnedList(self.allocator);
    defer params.deinit();

    var _id: ?[]const u8 = null;
    var _model: ?[]const u8 = null;
    var _target: ?[]const u8 = null;
    var _cpu: ?[]const u8 = null;

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

        if (std.mem.eql(u8, param.key, "target")) {
            if (param.value) |value| {
                _target = value.String;
            }
        }

        if (std.mem.eql(u8, param.key, "cpu")) {
            if (param.value) |value| {
                _cpu = value.String;
            }
        }
    }

    const id = _id orelse return r.sendBody("User ID not found\n");
    if (_model == null) {
        return r.sendBody("Model not found!\n");
    }
    if (_target == null) {
        return r.sendBody("Target architecture not found!\n");
    }
    if (_cpu == null) {
        return r.sendBody("CPU not found!\n");
    }

    const model = _model.?; // Unwrap the optional model name
    const target_arch = _target.?; // Unwrap the optional target architecture
    const cpu = _cpu.?; // Unwrap the optional CPU

    const generated_path = try std.fmt.allocPrint(self.allocator, "{s}/{s}/generated", .{ Constants.DATABASE_PATH, id });
    defer self.allocator.free(generated_path);

    const output_path = try std.fmt.allocPrint(self.allocator, "{s}/{s}/lib", .{ Constants.DATABASE_PATH, id });
    defer self.allocator.free(output_path);
    try std.fs.cwd().makePath(output_path);

    try Runner.libGen(self.allocator, model, target_arch, cpu, output_path, generated_path);

    return r.sendBody("Model found\n");
}

pub fn options(_: *Libgen, r: zap.Request) !void {
    try r.setHeader("Access-Control-Allow-Origin", "http://localhost:8000");
    try r.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    r.setStatus(zap.http.StatusCode.no_content);
    r.markAsFinished(true);
}
