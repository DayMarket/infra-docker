FROM public.ecr.aws/amazonlinux/amazonlinux:2 as installer

RUN yum update-minimal -y --security \
  && yum install -y unzip-6.0-43.amzn2 \
  && yum clean all \
  && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
  && unzip "awscliv2.zip" \
  # The --bin-dir is specified so that we can copy the
  # entire bin directory from the installer stage into
  # into /usr/local/bin of the final stage without
  # accidentally copying over any other executables that
  # may be present in /usr/local/bin of the installer stage.
  && ./aws/install --bin-dir /aws-cli-bin/

FROM public.ecr.aws/amazonlinux/amazonlinux:2
RUN yum update-minimal -y --security \
  && yum install -y less-458-9.amzn2.0.2 groff-1.22.2-8.amzn2.0.2 \
  && yum clean all
COPY --from=installer /usr/local/aws-cli/ /usr/local/aws-cli/
COPY --from=installer /aws-cli-bin/ /usr/local/bin/
WORKDIR /aws
