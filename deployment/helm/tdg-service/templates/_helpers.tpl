{{/*
_helpers.tpl — Helm template helpers for tdg-service
*/}}

{{- define "tdg-service.name" -}}
{{- .Values.service.name | default .Release.Name }}
{{- end }}

{{- define "tdg-service.labels" -}}
app: {{ include "tdg-service.name" . }}
release: {{ .Release.Name }}
chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}

{{- define "tdg-service.selectorLabels" -}}
app: {{ include "tdg-service.name" . }}
release: {{ .Release.Name }}
{{- end }}
