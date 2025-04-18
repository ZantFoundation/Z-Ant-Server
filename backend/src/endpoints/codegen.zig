const std = @import("std");
const zap = @import("zap");
const Runner = @import("../runner.zig");
const Constants = @import("../constants.zig");
pub const Codegen = @This();

allocator: std.mem.Allocator = undefined,
path: []const u8,
error_strategy: zap.Endpoint.ErrorStrategy = .log_to_response,

pub fn init(
    allocator: std.mem.Allocator,
    path: []const u8,
) Codegen {
    return .{
        .allocator = allocator,
        .path = path,
    };
}

pub fn deinit(_: *Codegen) void {}

pub fn put(_: *Codegen, _: zap.Request) !void {}
pub fn get(self: *Codegen, r: zap.Request) !void {
    try r.parseBody();
    const params = try r.parametersToOwnedList(self.allocator);
    defer params.deinit();

    var model: ?[]const u8 = null;
    var id: ?[]const u8 = null;
    for (params.items) |param| {
        if (std.mem.eql(u8, param.key, "id")) {
            if (param.value) |value| {
                id = value.String;
            }
        }
        if (std.mem.eql(u8, param.key, "model")) {
            if (param.value) |value| {
                model = value.String;
            }
        }
    }

    if (id == null) {
        return r.sendBody("User ID not found\n");
    }

    if (model == null) {
        return r.sendBody("Model not found\n");
    }

    const zip_code_path = try std.fmt.allocPrint(self.allocator, "{s}/{s}/zip/{s}.zip", .{
        Constants.DATABASE_PATH,
        id.?,
        model.?,
    });
    defer self.allocator.free(zip_code_path);
    const file = try std.fs.cwd().openFile(zip_code_path, .{});
    defer file.close();
    const file_size = try file.getEndPos();
    const file_data = try file.readToEndAlloc(self.allocator, file_size);
    defer self.allocator.free(file_data);
    try r.setHeader("Content-Type", "application/zip");
    try r.setHeader("Content-Disposition", try std.fmt.allocPrint(self.allocator, "attachment; filename=\"{s}.zip\"", .{model.?}));
    try r.setHeader("Access-Control-Allow-Origin", Constants.WEBSITE_URL);
    try r.sendBody(file_data);
}

pub fn patch(_: *Codegen, _: zap.Request) !void {}
pub fn delete(_: *Codegen, _: zap.Request) !void {}

pub fn post(self: *Codegen, r: zap.Request) !void {
    //try self.options(r);
    try r.parseBody();
    r.parseQuery();

    const params = try r.parametersToOwnedList(self.allocator);
    defer params.deinit();

    var _id: ?[]const u8 = null;
    var _file: ?zap.Request.HttpParamBinaryFile = null;
    var _model: ?[]const u8 = null;

    for (params.items) |param| {
        if (std.mem.eql(u8, param.key, "id")) {
            if (param.value) |value| {
                _id = value.String;
            }
        }

        if (std.mem.eql(u8, param.key, "file")) {
            if (param.value) |value| {
                _file = value.Hash_Binfile;
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

    const id = _id.?;

    if (_model == null and _file == null) {
        return r.sendBody("Provide either model name or a custom onnx file.\n");
    }

    if (_model != null and _file != null) {
        return r.sendBody("Provide either model name or a custom onnx file, not both.\n");
    }

    if (_model) |model| {
        const generated_code_path = try std.fmt.allocPrint(self.allocator, "{s}/{s}/generated/", .{ Constants.DATABASE_PATH, id });
        defer self.allocator.free(generated_code_path);
        try std.fs.cwd().makePath(generated_code_path);

        try Runner.codeGenModel(self.allocator, generated_code_path, model);

        const zip_code_path = try std.fmt.allocPrint(self.allocator, "{s}/{s}/zip/", .{
            Constants.DATABASE_PATH,
            id,
        });
        defer self.allocator.free(zip_code_path);
        try std.fs.cwd().makePath(zip_code_path);
        const response = .{ .message = "Code generation completed successfully" };
        const json_str = try std.json.stringifyAlloc(self.allocator, response, .{});
        try r.setHeader("Content-Type", "application/json");
        try r.setHeader("Access-Control-Allow-Origin", Constants.WEBSITE_URL);
        try r.sendBody(json_str);
    }

    if (_file == null) {
        return r.sendBody("File not found\n");
    }

    const file = _file.?;

    if (file.data == null) {
        return r.sendBody("File data not found\n");
    }

    const file_data = file.data.?;

    if (file.filename == null) {
        return r.sendBody("File name not found\n");
    }

    const file_name = file.filename.?;

    const dot_index = std.mem.lastIndexOf(u8, file_name, ".") orelse file_name.len;
    const filename = file_name[0..dot_index];

    const model_path = try std.fmt.allocPrint(self.allocator, "{s}/{s}/models/", .{ Constants.DATABASE_PATH, id });
    defer self.allocator.free(model_path);
    try std.fs.cwd().makePath(model_path);

    try Runner.writeFileToDatabase(self.allocator, file_data, model_path, filename);

    const generated_code_path = try std.fmt.allocPrint(self.allocator, "{s}/{s}/generated", .{ Constants.DATABASE_PATH, id });
    defer self.allocator.free(generated_code_path);
    try std.fs.cwd().makePath(generated_code_path);

    try Runner.codeGenCustom(self.allocator, model_path, generated_code_path, filename);

    const zip_code_path = try std.fmt.allocPrint(self.allocator, "{s}/{s}/zip", .{
        Constants.DATABASE_PATH,
        id,
    });
    defer self.allocator.free(zip_code_path);
    try std.fs.cwd().makePath(zip_code_path);

    try Runner.zipFolder(self.allocator, generated_code_path, filename);

    const response = .{ .message = "Code generation completed successfully" };
    const json_str = try std.json.stringifyAlloc(self.allocator, response, .{});
    try r.setHeader("Content-Type", "application/json");
    try r.setHeader("Access-Control-Allow-Origin", Constants.WEBSITE_URL);
    try r.sendBody(json_str);
}

pub fn options(_: *Codegen, r: zap.Request) !void {
    try r.setHeader("Access-Control-Allow-Origin", "http://localhost:8000");
    try r.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    r.setStatus(zap.http.StatusCode.no_content);
    r.markAsFinished(true);
}
