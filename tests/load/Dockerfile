FROM grafana/xk6:latest AS builder
RUN xk6 build latest \
    --with github.com/LeonAdato/xk6-output-statsd@latest \
    --output /tmp/k6

FROM alpine:3.19
COPY --from=builder /tmp/k6 /usr/bin/k6
ENTRYPOINT ["k6"]
