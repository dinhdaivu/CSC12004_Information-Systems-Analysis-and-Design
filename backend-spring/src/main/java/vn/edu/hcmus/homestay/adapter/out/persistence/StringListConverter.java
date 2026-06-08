package vn.edu.hcmus.homestay.adapter.out.persistence;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Converts between {@code List<String>} and a PostgreSQL array literal of the form
 * {@code {item1,"item with, comma",item3}}.
 *
 * <p>Uses PostgreSQL's native quoting rules: elements containing commas, double-quotes, or
 * backslashes are wrapped in double quotes with internal {@code "} and {@code \} escaped.
 */
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {

    @Override
    public String convertToDatabaseColumn(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "{}";
        }
        String joined =
                list.stream().map(StringListConverter::quoteElement).collect(Collectors.joining(","));
        return "{" + joined + "}";
    }

    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new ArrayList<>();
        }
        String trimmed = dbData.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        if (trimmed.isEmpty()) {
            return new ArrayList<>();
        }
        return parseElements(trimmed);
    }

    private static String quoteElement(String s) {
        if (s == null) {
            return "NULL";
        }
        // Quote if element contains comma, double-quote, backslash, or curly brace
        if (s.contains(",") || s.contains("\"") || s.contains("\\") || s.contains("{") || s.contains("}")) {
            return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
        }
        return s;
    }

    /** Parses PostgreSQL array element list, respecting double-quoted elements. */
    private static List<String> parseElements(String input) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (inQuotes) {
                if (c == '\\' && i + 1 < input.length()) {
                    current.append(input.charAt(++i)); // consume escaped char literally
                } else if (c == '"') {
                    inQuotes = false; // closing quote — don't append
                } else {
                    current.append(c);
                }
            } else {
                if (c == '"') {
                    inQuotes = true; // opening quote — don't append
                } else if (c == ',') {
                    result.add(current.toString());
                    current = new StringBuilder();
                } else {
                    current.append(c);
                }
            }
        }
        result.add(current.toString());
        return result;
    }
}
